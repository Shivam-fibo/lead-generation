"use client"

import React, { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSessionStore } from "@/stores/ai-session-store"
import { aiAssistantApi, aiSessionApi, type ChatMessage, type ChatSession } from "@/lib/api"

export const useAiSession = (sessionId?: string, options?: {
    enableQueries?: boolean
}) => {
    const queryClient = useQueryClient()
    const enableQueries = options?.enableQueries ?? true
    const {
        currentSession,
        currentSessionId,
        currentMessages,
        sessions,
        isLoading: storeLoading,
        isSessionLoading,
        isSessionsLoading,
        loadSession,
        createNewSession,
        loadAllSessions,
        deleteSession,
        updateSessionTitle,
        setLoading,
    } = useSessionStore()

    // Query for all sessions
    const {
        data: sessionsData,
        isLoading: isSessionsQueryLoading,
        isError: isSessionsError,
        error: sessionsError,
    } = useQuery({
        queryKey: ["aiSessions"],
        queryFn: () => aiSessionApi.getAllSessions(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: enableQueries,
    })

    // Query for specific session messages (only if sessionId is provided)
    const {
        data: sessionData,
        isLoading: isSessionQueryLoading,
        isError: isMessagesError,
        error: messagesError,
    } = useQuery({
        queryKey: ["sessionMessages", sessionId],
        queryFn: () => sessionId ? aiSessionApi.getSession(sessionId) : Promise.resolve([]),
        enabled: !!sessionId,
        staleTime: 1 * 60 * 1000, // 1 minute
    })

    useEffect(() => {
        if (sessionsData) {
            useSessionStore.setState({ sessions: sessionsData })
        }
    }, [sessionsData])

    useEffect(() => {
        if (sessionData && sessionId) {
            useSessionStore.setState({
                currentSessionId: sessionId,
                currentSession: sessionData
            })
        }
    }, [sessionData, sessionId])

    // Mutation for creating new session
    const createSessionMutation = useMutation({
        mutationFn: (title?: string) => aiSessionApi.createAISession(title || "New Chat"),
        onSuccess: (newSession) => {

            queryClient.setQueryData(["aiSessions"], (old: ChatSession[]) => {
                return old ? [newSession, ...old] : [newSession]
            })

            useSessionStore.setState(state => ({
                sessions: [newSession, ...state.sessions],
                currentSessionId: newSession.id,
                currentMessages: []
            }))
        },
        onError: (error) => {
            console.error('Failed to create session:', error)
        }
    })

    // Mutation for sending message
    const sendMessageMutation = useMutation({
        mutationFn: ({ message, sessionId: targetSessionId }: { message: string, sessionId: string }) => {
            console.log('sendMessageMutation.mutationFn called:', { message, sessionId: targetSessionId });
            return aiAssistantApi.chatWithAI({ message, sessionId: targetSessionId });
        },
        onSuccess: (aiResponse, { sessionId: targetSessionId }) => {
            console.log("checking onsuccess")
            if (aiResponse) {
                useSessionStore.setState(state => ({
                    currentMessages: [...state.currentMessages, aiResponse]
                }));
            }
        },
        onError: (error, variables, context) => {
            console.error('Failed to send message:', error);
        }
    });

    // Mutation for deleting session
    const deleteSessionMutation = useMutation({
        mutationFn: (sessionId: string) => aiSessionApi.deleteSession(sessionId),
        onSuccess: (_, deletedSessionId) => {
            // Update sessions list in cache
            queryClient.setQueryData(["aiSessions"], (old: ChatSession[]) => {
                return old ? old.filter(session => session.id !== deletedSessionId) : []
            })

            // Update store
            useSessionStore.setState(state => ({
                sessions: state.sessions.filter(s => s.id !== deletedSessionId),
                ...(state.currentSessionId === deletedSessionId && {
                    currentSessionId: null,
                    currentMessages: []
                })
            }))

            // Remove session messages from cache
            queryClient.removeQueries({ queryKey: ["sessionMessages", deletedSessionId] })
        },
        onError: (error) => {
            console.error('Failed to delete session:', error)
        }
    })

    // Mutation for updating session title
    const updateSessionTitleMutation = useMutation({
        mutationFn: ({ sessionId, title }: { sessionId: string, title: string }) =>
            aiSessionApi.updateSessionTitle(sessionId, title),
        onSuccess: (_, { sessionId, title }) => {
            // Update sessions list in cache
            queryClient.setQueryData(["aiSessions"], (old: ChatSession[]) => {
                return old ? old.map(session =>
                    session.id === sessionId ? { ...session, title } : session
                ) : []
            })

            // Update store
            useSessionStore.setState(state => ({
                sessions: state.sessions.map(session =>
                    session.id === sessionId ? { ...session, title } : session
                )
            }))
        },
        onError: (error) => {
            console.error('Failed to update session title:', error)
        }
    })

    const approveAiGoalMutation = useMutation({
        mutationFn: (goal?: any) => aiAssistantApi.ApproveAIGoal(goal),
        onSuccess: (newSession) => {
            console.log('success fetching approve goals')
        },
        onError: (error) => {
            console.error('Failed to create session:', error)
        }
    })


    // Helper functions that combine store actions with query invalidation
    // Updated to support your callback pattern
    const createSession = (
        params: { title?: string } | string,
        options?: {
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
        }
    ) => {
        const title = typeof params === 'string' ? params : params?.title || "New Chat"

        return createSessionMutation.mutate(title, {
            onSuccess: (data) => {
                options?.onSuccess?.(data)
            },
            onError: (error) => {
                options?.onError?.(error)
            }
        })
    }



    const sendMessageToSession = (
        params: { message: string; sessionId?: string },
        options?: {
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
        }
    ) => {
        const sessionToUse = params.sessionId || currentSessionId
        if (!sessionToUse) {
            throw new Error('No active session')
        }

        // Prevent duplicate mutations
        if (sendMessageMutation.isPending) {
            return;
        }

        return sendMessageMutation.mutate(
            { message: params.message, sessionId: sessionToUse },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data)
                },
                onError: (error) => {
                    options?.onError?.(error)
                }
            }
        )
    }

    const deleteSessionById = (
        params: { sessionId: string },
        options?: {
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
        }
    ) => {
        return deleteSessionMutation.mutate(params.sessionId, {
            onSuccess: (data) => {
                options?.onSuccess?.(data)
            },
            onError: (error) => {
                options?.onError?.(error)
            }
        })
    }

    const updateSessionTitleById = (
        params: { sessionId: string; title: string },
        options?: {
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
        }
    ) => {
        return updateSessionTitleMutation.mutate(
            { sessionId: params.sessionId, title: params.title },
            {
                onSuccess: (data) => {
                    options?.onSuccess?.(data)
                },
                onError: (error) => {
                    options?.onError?.(error)
                }
            }
        )
    }

    const approveAiGoal = (
        params: { goal?: any },
        options?: {
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
        }
    ) => {
        const goal = params

        return approveAiGoalMutation.mutate(goal, {
            onSuccess: (data) => {
                options?.onSuccess?.(data)
            },
            onError: (error) => {
                options?.onError?.(error)
            }
        })
    }


    // Async versions (for backward compatibility)
    const createSessionAsync = async (title?: string) => {
        return createSessionMutation.mutateAsync(title)
    }

    const sendMessageAsync = async (message: string, targetSessionId?: string) => {
        const sessionToUse = targetSessionId || currentSessionId
        if (!sessionToUse) {
            throw new Error('No active session')
        }
        return sendMessageMutation.mutateAsync({ message, sessionId: sessionToUse })
    }

    const deleteSessionAsync = async (sessionId: string) => {
        return deleteSessionMutation.mutateAsync(sessionId)
    }

    const updateSessionTitleAsync = async (sessionId: string, title: string) => {
        return updateSessionTitleMutation.mutateAsync({ sessionId, title })
    }

    const refreshSessions = () => {
        queryClient.invalidateQueries({ queryKey: ["aiSessions"] })
    }

    const refreshMessages = (sessionId?: string) => {
        const targetSessionId = sessionId || currentSessionId
        if (targetSessionId) {
            queryClient.invalidateQueries({ queryKey: ["sessionMessages", targetSessionId] })
        }
    }

    return {
        sessions: sessionsData || sessions,
        currentSession,
        currentMessages: currentMessages,
        currentSessionId,

        // Loading states
        isLoading: isSessionsQueryLoading || storeLoading,
        isSessionLoading: isSessionQueryLoading,
        isSessionsLoading: isSessionsQueryLoading || isSessionsLoading,

        // Individual mutation loading states
        isCreatingSession: createSessionMutation.isPending,
        isSendingMessage: sendMessageMutation.isPending,
        isDeletingSession: deleteSessionMutation.isPending,
        isUpdatingTitle: updateSessionTitleMutation.isPending,

        // Error states
        isError: isSessionsError || isMessagesError,
        error: sessionsError || messagesError,

        // Actions (callback pattern - matches your system)
        createSession,
        sendMessageToSession,
        deleteSession: deleteSessionById,
        updateSessionTitle: updateSessionTitleById,
        approveAiGoal,

        // Async versions (for those who prefer promises)
        createSessionAsync,
        sendMessageAsync,
        deleteSessionAsync,
        updateSessionTitleAsync,

        // Refresh functions
        refreshSessions,
        refreshMessages,

        // Raw mutations (if you need more control)
        createSessionMutation,
        sendMessageMutation,
        deleteSessionMutation,
        updateSessionTitleMutation,
    }
}