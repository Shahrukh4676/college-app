import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Radius, Spacing, Typography, Shadows } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import { AppHeader } from '@/components/ui/app-header';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Ionicons } from '@expo/vector-icons';

function formatMessageTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState('');

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
  });

  const conversation = conversations?.find((c) => c.id === id);

  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: ['chat_messages', id],
    queryFn: () => chatService.getMessages(id as string),
    enabled: !!id,
    refetchInterval: 4000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => chatService.sendMessage(id as string, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = () => {
    if (!id || !inputMessage.trim() || sendMutation.isPending) return;
    const text = inputMessage.trim();
    setInputMessage('');
    sendMutation.mutate(text);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AppHeader
        title={conversation?.participant.fullName || 'Peer Chat'}
        subtitle={conversation?.taskTitle || 'Task Coordination'}
        canGoBack
      />

      <ResponsiveContainer maxWidth={840} style={{ flex: 1 }}>
        <View style={styles.chatWrapper}>
          <FlatList
            data={messages || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.messagesContainer, { paddingBottom: Spacing.lg }]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMine = item.senderId === user?.id;
              return (
                <View
                  style={[
                    styles.bubbleWrapper,
                    isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.myBubble : styles.theirBubble,
                    ]}
                  >
                    {!isMine && <Text style={styles.senderName}>{item.senderName}</Text>}
                    <Text style={[styles.bubbleText, isMine && styles.myBubbleText]}>
                      {item.text}
                    </Text>
                    <View style={styles.timeStatusRow}>
                      <Text style={[styles.timeText, isMine && styles.myTimeText]}>
                        {formatMessageTime(item.timestamp)}
                      </Text>
                      {isMine && (
                        <Ionicons
                          name="checkmark-done"
                          size={14}
                          color={Palette.primary200}
                          style={styles.readCheck}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              isLoading ? null : isError ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: Palette.danger500 }]}>
                    Unable to load messages. Please check your connection.
                  </Text>
                  <Pressable
                    onPress={() => refetch()}
                    style={styles.retryChatBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading messages"
                  >
                    <Text style={styles.retryChatBtnText}>Retry</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={32} color={Palette.slate300} />
                  <Text style={styles.emptyText}>
                    No messages yet. Say hello and coordinate the task details!
                  </Text>
                </View>
              )
            }
          />

          {/* Composer */}
          <View style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Type an academic message..."
              placeholderTextColor={Palette.slate400}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={2000}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputMessage.trim() || sendMutation.isPending}
              style={[
                styles.sendBtn,
                (!inputMessage.trim() || sendMutation.isPending) && styles.sendBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Ionicons
                name="send"
                size={18}
                color={!inputMessage.trim() || sendMutation.isPending ? Palette.slate400 : Palette.white}
              />
            </Pressable>
          </View>
        </View>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  chatWrapper: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  bubbleWrapper: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  theirBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadows.sm,
  },
  myBubble: {
    backgroundColor: Palette.primary600,
    borderBottomRightRadius: Radius.xs,
  },
  theirBubble: {
    backgroundColor: Palette.white,
    borderBottomLeftRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  senderName: {
    ...Typography.tiny,
    fontWeight: '700',
    color: Palette.primary700,
    marginBottom: 3,
  },
  bubbleText: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate900,
    lineHeight: 20,
  },
  myBubbleText: {
    color: Palette.white,
  },
  timeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    ...Typography.tiny,
    fontSize: 10,
    color: Palette.slate400,
  },
  myTimeText: {
    color: Palette.primary100,
  },
  readCheck: {
    marginLeft: 2,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    ...Typography.body,
    fontSize: 14,
    color: Palette.slate500,
    textAlign: 'center',
  },
  retryChatBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Palette.primary50,
    borderRadius: Radius.md,
  },
  retryChatBtnText: {
    ...Typography.captionBold,
    color: Palette.primary700,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Palette.slate100,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: Palette.slate900,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Palette.slate200,
  },
});
