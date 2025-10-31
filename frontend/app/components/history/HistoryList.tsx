"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Tv, ChevronDown, ChevronUp, Trash2, User, Eye, EyeOff } from "lucide-react";
import TranscriptExpandedView from "../transcriptExpandedDetails/TranscriptExpandedView";
import { deleteHistory, updateTranscriptVisibility } from "../../../src/utils/api";
import { toast } from "react-toastify";

interface TranscriptData {
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  created_at: string;
}

interface HistoryListProps {
  history: TranscriptData[];
  onDelete: (id: number) => void;
  onUpdateVisibility?: (id: number, visibility: string) => void;
}

export default function HistoryList({ history, onDelete, onUpdateVisibility }: HistoryListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: number | null}>({show: false, id: null});

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedItems(newExpanded);
  };

  const handleDelete = (id: number) => {
    setDeleteModal({show: true, id});
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.id === null) return;
    const id = deleteModal.id;
    setDeleteModal({show: false, id: null});
    setDeletingItems(prev => new Set(prev).add(id));
    try {
      const result = await deleteHistory(id);
      if (result.message) {
        onDelete(id);
        toast.success("Summary deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete summary");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete summary");
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({show: false, id: null});
  };

  const handleToggleVisibility = async (id: number, currentVisibility: string | undefined) => {
    const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    try {
      const result = await updateTranscriptVisibility(id, newVisibility);
      if (!result.error) {
        if (onUpdateVisibility) {
          onUpdateVisibility(id, newVisibility);
        }
        toast.success(`Transcript is now ${newVisibility.toLowerCase()}`);
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    } catch (error) {
      console.error("Visibility update error:", error);
      toast.error("Failed to update visibility");
    }
  };

  useEffect(() => {
    if (deleteModal.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [deleteModal.show]);

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 lg:px-12 py-4">
      {history.map(item => (
        <div
          key={item.id}
          className="bg-gray-900/60 hover:bg-gray-800 border border-gray-700 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden hover:border-blue-700 transition-all duration-300 cursor-pointer"
          onClick={() => toggleExpanded(item.id)}
        >
          {/* Header Section */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
         
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt={item.title || "Video thumbnail"}
                  className="w-full sm:w-40 h-48 sm:h-28 object-cover rounded-lg shadow-md"
                />
              )}

              {/* Video Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2">
                  {item.title || "Untitled Video"}
                </h3>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-400">
                  {item.channel_name && (
                    <div className="flex items-center gap-1">
                      <Tv className="w-4 h-4" />
                      {item.channel_name}
                    </div>
                  )}
                  {item.host_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Host: {item.host_name}
                    </div>
                  )}
                  {item.guest_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Guest: {item.guest_name}
                    </div>
                  )}
                  {item.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.duration}
                    </div>
                  )}
                  {item.publish_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.publish_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Summary Preview */}
                <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Buttons (Right Side / Bottom on Mobile) */}
              <div className="flex justify-end sm:flex-col sm:justify-between gap-2 sm:gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  disabled={deletingItems.has(item.id)}
                  className="flex items-center justify-center gap-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  title="Delete summary"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleVisibility(item.id, item.visibility); }}
                  className={`flex items-center justify-center gap-1 transition-colors ${
                    item.visibility === 'PUBLIC'
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  title={item.visibility === 'PUBLIC' ? 'Make Private' : 'Make Public'}
                >
                  {item.visibility === 'PUBLIC' ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleExpanded(item.id); }}
                  className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {expandedItems.has(item.id) ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Section */}
          {expandedItems.has(item.id) && (
            <div className="border-t border-gray-700 p-4 sm:p-6">
              <TranscriptExpandedView transcript={item} showMeta={false} showSentiment={false} />
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.id !== null && (() => {
        const itemToDelete = history.find(item => item.id === deleteModal.id);
        return (
          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Confirm Delete
              </h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="font-bold">"{itemToDelete?.title || 'Untitled Video'}"</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
