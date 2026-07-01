/**
 * Blocklist Admin UI
 * 
 * Location: app/pages/admin/blocklist.tsx
 * 
 * Purpose: Dashboard to manage blocklist entries
 * Features:
 * - List all blocklist entries (paginated, searchable)
 * - Add new domain + category
 * - Toggle active/inactive
 * - Delete domain
 * - Bulk upload CSV of domains
 * - Filter by category
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface BlocklistEntry {
  id: number;
  domain: string;
  category: string;
  active: boolean;
  description?: string;
  added_at: string;
}

const CATEGORIES = [
  'analytics',
  'advertising',
  'social-media',
  'customer-support',
  'monitoring',
  'marketing',
  'consent',
  'tracker'
];

const ITEMS_PER_PAGE = 20;

export default function BlocklistAdmin() {
  const [entries, setEntries] = useState<BlocklistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<BlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState('analytics');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Load blocklist
  useEffect(() => {
    loadBlocklist();
  }, []);

  // Filter entries
  useEffect(() => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [entries, searchTerm, selectedCategory]);

  const loadBlocklist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blocklist_rules')
        .select('*')
        .order('domain', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load blocklist';
      setError(message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) {
      setError('Domain is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blocklist_rules')
        .insert([
          {
            domain: newDomain.trim().toLowerCase(),
            category: newCategory,
            description: newDescription || null,
            active: true
          }
        ])
        .select();

      if (error) throw error;

      setEntries([...entries, ...(data || [])]);
      setNewDomain('');
      setNewCategory('analytics');
      setNewDescription('');
      setShowAddForm(false);
      setSuccess('Domain added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add domain';
      setError(message);
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('blocklist_rules')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.map(e =>
        e.id === id ? { ...e, active: !currentActive } : e
      ));
      setSuccess('Updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      setError(message);
    }
  };

  const deleteDomain = async (id: number, domain: string) => {
    if (!confirm(`Delete ${domain}?`)) return;

    try {
      const { error } = await supabase
        .from('blocklist_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.filter(e => e.id !== id));
      setSuccess('Domain deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setError(message);
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const text = await file.text();
      const domains = text.split('\n')
        .map(d => d.trim().toLowerCase())
        .filter(d => d && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d));

      if (domains.length === 0) {
        setError('No valid domains found in file');
        return;
      }

      const entries = domains.map(domain => ({
        domain,
        category: 'tracker',
        description: 'Bulk imported',
        active: true
      }));

      const { data, error } = await supabase
        .from('blocklist_rules')
        .insert(entries)
        .select();

      if (error) throw error;

      setEntries([...entries, ...data || []]);
      setSuccess(`Bulk uploaded ${data?.length || 0} domains`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bulk upload failed';
      setError(message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Blocklist Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage tracker domains for Ghosted app
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Entries</p>
            <p className="text-3xl font-bold text-primary">{entries.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-500">
              {entries.filter(e => e.active).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Inactive</p>
            <p className="text-3xl font-bold text-red-500">
              {entries.filter(e => !e.active).length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
            {success}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={loadBlocklist}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>

            {/* Add Domain */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {showAddForm ? 'Cancel' : '+ Add Domain'}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="domain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <button
                onClick={addDomain}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          )}

          {/* Bulk Upload */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 text-sm mb-2 block">
                Bulk Upload (CSV/TXT):
              </span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => e.target.files?.[0] && handleBulkUpload(e.target.files[0])}
                className="block w-full text-sm text-gray-900 dark:text-gray-300"
              />
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Loading...
            </div>
          ) : paginatedEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              No entries found
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Domain</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-mono">{entry.domain}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(entry.id, entry.active)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            entry.active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {entry.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteDomain(entry.id, entry.domain)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
