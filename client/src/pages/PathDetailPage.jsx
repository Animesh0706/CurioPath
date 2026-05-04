import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { pathAPI } from "../api/pathAPI";
import { progressAPI } from "../api/progressAPI";
import { resourceAPI } from "../api/resourceAPI";
import useAuthStore from "../stores/authStore";

const PathDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [addError, setAddError] = useState("");
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: path, isLoading } = useQuery({
    queryKey: ["path", id],
    queryFn: () => pathAPI.getById(id),
    select: (res) => res.data.data.path,
  });

  const { data: progressData } = useQuery({
    queryKey: ["pathProgress", id],
    queryFn: () => progressAPI.getPathProgress(id),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  // Fetch all available resources for the picker
  const { data: allResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources-picker", pickerSearch],
    queryFn: () => resourceAPI.getAll({ limit: 50, search: pickerSearch || undefined }),
    select: (res) => res.data.data.resources,
    enabled: showPicker,
  });

  const addMut = useMutation({
    mutationFn: (rid) => pathAPI.addResource(id, rid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path", id] });
      setAddError("");
    },
    onError: (err) => {
      setAddError(err.response?.data?.message || "Failed to add resource");
    },
  });

  const removeMut = useMutation({
    mutationFn: (rid) => pathAPI.removeResource(id, rid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path", id] });
    },
  });

  const progressMut = useMutation({
    mutationFn: ({ resourceId, status }) => progressAPI.update({ resourceId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pathProgress", id] });
    },
  });

  const reorderMut = useMutation({
    mutationFn: (orderedItems) => pathAPI.reorder(id, orderedItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path", id] });
    },
    onMutate: async (newOrderedItems) => {
      await queryClient.cancelQueries({ queryKey: ["path", id] });
      const previousPath = queryClient.getQueryData(["path", id]);

      // Optimistically update the UI to avoid flicker
      queryClient.setQueryData(["path", id], (old) => {
        if (!old) return old;
        const newResources = [...old.data.data.path.resources];
        // Re-sort the array based on the newOrderedItems indices
        const sortedMap = new Map(newOrderedItems.map((item, idx) => [item.resourceId, idx]));
        newResources.sort((a, b) => {
          return (sortedMap.get(a.resourceId) ?? Infinity) - (sortedMap.get(b.resourceId) ?? Infinity);
        });

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              path: {
                ...old.data.data.path,
                resources: newResources
              }
            }
          }
        };
      });

      return { previousPath };
    },
    onError: (err, newOrderedItems, context) => {
      queryClient.setQueryData(["path", id], context.previousPath);
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const items = Array.from(path.resources);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);
    
    // Map to array of { resourceId, orderIndex }
    const orderedPayload = items.map((item, index) => ({
      resourceId: item.resource.id,
      orderIndex: index
    }));
    
    reorderMut.mutate(orderedPayload);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined spinner text-4xl text-primary">autorenew</span>
      </div>
    );
  if (!path)
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        Path not found.
      </div>
    );

  const pMap = {};
  progressData?.resources?.forEach((r) => {
    pMap[r.resourceId] = r.status;
  });

  const isOwner = user && path.creatorId === user.id;

  // IDs of resources already in this path
  const existingIds = new Set(path.resources?.map((pr) => pr.resource?.id) || []);

  // Filter out resources that are already added
  const availableResources = (allResources || []).filter((r) => !existingIds.has(r.id));

  const getTypeStyle = (type) => {
    switch (type) {
      case "VIDEO":
        return { icon: "play_circle", bg: "bg-tertiary/20 text-tertiary", badge: "bg-tertiary/10 border-tertiary/20 text-tertiary" };
      case "ARTICLE":
        return { icon: "article", bg: "bg-primary/20 text-primary", badge: "bg-primary/10 border-primary/20 text-primary" };
      case "COURSE":
        return { icon: "school", bg: "bg-secondary/20 text-secondary", badge: "bg-secondary/10 border-secondary/20 text-secondary" };
      case "BOOK":
        return { icon: "menu_book", bg: "bg-surface-container-highest text-on-surface", badge: "bg-surface-container-highest border-outline-variant text-on-surface" };
      default:
        return { icon: "insert_drive_file", bg: "bg-surface-container-highest text-on-surface-variant", badge: "bg-surface-container border-outline text-outline" };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "border-l-4 border-l-tertiary bg-tertiary-container/5";
      case "IN_PROGRESS":
        return "border-l-4 border-l-primary bg-primary-container/5";
      default:
        return "hover:border-l-4 hover:border-l-outline-variant";
    }
  };

  return (
    <div className="animate-fade-in relative min-h-screen pb-20 max-w-5xl mx-auto">
      {/* Hero Header */}
      <header className="relative pt-12 pb-12 overflow-hidden border-b border-white/5 mb-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary mb-4 font-label-md">
            <Link to="/paths" className="hover:text-primary-fixed-dim transition-colors">Paths</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface-variant">{path.title}</span>
          </div>
          <h1 className="font-display-xl text-on-surface mb-6 leading-tight tracking-tighter">{path.title}</h1>
          <p className="font-body-lg text-on-surface-variant max-w-3xl mb-12">{path.description}</p>

          {/* Progress Section */}
          {progressData && (
            <div className="glass-card rounded-xl p-md">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="block font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Path Progress</span>
                  <span className="font-headline-md text-primary">{Math.round(progressData.percentage)}%</span>
                </div>
                <div className="font-label-md text-on-surface-variant">
                  {progressData.completed} of {progressData.totalResources} resources completed
                </div>
              </div>
              <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full relative transition-all duration-1000"
                  style={{ width: `${progressData.percentage}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-[2px]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Add Resource — Browse Picker */}
      {isOwner && (
        <div className="mb-12 relative" ref={pickerRef}>
          {addError && <p className="text-error mb-2 font-label-md">{addError}</p>}

          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">{showPicker ? "close" : "library_add"}</span>
            <span className="font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
              {showPicker ? "Close resource browser" : "Browse & add resources to this path…"}
            </span>
            <span className="material-symbols-outlined text-outline ml-auto">{showPicker ? "expand_less" : "expand_more"}</span>
          </button>

          {showPicker && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 glass-card rounded-xl border border-outline-variant/50 shadow-2xl shadow-black/40 overflow-hidden animate-fade-in">
              {/* Search bar */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md"
                    placeholder="Search resources by title…"
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Resource list */}
              <div className="max-h-80 overflow-y-auto">
                {resourcesLoading && (
                  <div className="flex items-center justify-center py-8">
                    <span className="material-symbols-outlined spinner text-2xl text-primary">autorenew</span>
                  </div>
                )}

                {!resourcesLoading && availableResources.length === 0 && (
                  <div className="py-8 text-center text-on-surface-variant font-body-md">
                    {pickerSearch ? "No matching resources found." : "All resources have already been added."}
                  </div>
                )}

                {availableResources.map((resource) => {
                  const style = getTypeStyle(resource.type);
                  return (
                    <button
                      key={resource.id}
                      onClick={() => addMut.mutate(resource.id)}
                      disabled={addMut.isPending}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left group/item border-b border-white/5 last:border-b-0 disabled:opacity-50"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                        <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider border ${style.badge}`}>
                            {resource.type}
                          </span>
                          <h4 className="font-body-md font-medium text-on-surface truncate group-hover/item:text-primary transition-colors">
                            {resource.title}
                          </h4>
                        </div>
                        <p className="font-label-sm text-on-surface-variant truncate">{resource.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">add_circle</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource List with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="path-resources" isDropDisabled={!isOwner}>
          {(provided) => (
            <div 
              className="space-y-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <h2 className="font-headline-md text-on-surface mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">format_list_numbered</span>
                Learning Modules
              </h2>

              {path.resources?.length === 0 && (
                <p className="text-on-surface-variant">No resources added to this path yet.</p>
              )}

              {path.resources?.map((pr, index) => {
                const res = pr.resource;
                const status = pMap[res.id] || "TODO";
                const style = getTypeStyle(res.type);
                const isCompleted = status === "COMPLETED";

                return (
                  <Draggable key={pr.id} draggableId={pr.id} index={index} isDragDisabled={!isOwner}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`glass-card rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4 group transition-all duration-300 ${getStatusStyle(status)} ${snapshot.isDragging ? 'shadow-2xl shadow-primary/20 scale-[1.02] border-primary/50 z-50' : ''}`}
                        style={provided.draggableProps.style}
                      >
                        <div 
                          className={`hidden md:flex text-on-surface-variant opacity-50 ${isOwner ? 'cursor-grab active:cursor-grabbing hover:opacity-100' : ''}`}
                          {...provided.dragHandleProps}
                        >
                          <span className="material-symbols-outlined">drag_indicator</span>
                        </div>

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-headline-md border border-white/5 ${isCompleted ? style.bg : "bg-surface-container-high text-on-surface-variant"}`}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className="flex-1 min-w-0 w-full cursor-pointer" onClick={() => window.open(res.url, "_blank")}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider border ${style.badge}`}>
                              {res.type}
                            </span>
                            <h3 className={`font-body-md font-medium text-on-surface truncate group-hover:text-primary transition-colors ${isCompleted ? "opacity-70" : ""}`}>
                              {res.title}
                            </h3>
                          </div>
                          <p className="font-label-sm text-on-surface-variant truncate pr-4">{res.description}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 justify-end">
                          {isAuthenticated && (
                            <select
                              className="bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 appearance-none font-label-md cursor-pointer pr-8"
                              value={status}
                              onChange={(e) => progressMut.mutate({ resourceId: res.id, status: e.target.value })}
                            >
                              <option value="TODO">Todo</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          )}

                          {isOwner && (
                            <button
                              onClick={() => removeMut.mutate(res.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors md:opacity-0 group-hover:opacity-100"
                              title="Remove from path"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PathDetailPage;
