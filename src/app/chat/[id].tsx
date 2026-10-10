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
import { Palette, Radius, Spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import { AppHeader } from '@/components/ui/app-header';
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
    refetchInterval: 4000, // 4-second polling for updates
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
        subtitle={conversation?.taskTitle || 'Task Collaboration'}
        canGoBack
      />

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
                Unable to load messages. Check your connection or verify chat server status.
              </Text>
              <Pressable
                onPress={() => refetch()}
                style={({ pressed }) => [styles.retryChatBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Retry loading messages"
              >
                <Text style={styles.retryChatBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No messages yet. Say hello and coordinate the academic assistance requirements!
              </Text>
            </View>
          )
        }
      />

      {/* Input row */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor={Palette.slate400}
          value={inputMessage}
          onChangeText={setInputMessage}
          style={styles.textInput}
          multiline
        />

        <Pressable
          onPress={handleSend}
          disabled={!inputMessage.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            !inputMessage.trim() && styles.sendBtnDisabled,
            pressed && styles.sendBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="arrow-up" size={20} color={Palette.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  messagesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  bubbleWrapper: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  myBubble: {
    backgroundColor: Palette.primary600,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Palette.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primary700,
    marginBottom: 2,
  },
  bubbleText: {
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
    gap: 3,
  },
  timeText: {
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
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Palette.slate500,
    textAlign: 'center',
    lineHeight: 19,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.slate900,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Palette.slate300,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
  retryChatBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.primary600,
  },
  retryChatBtnText: {
    color: Palette.primary600,
    fontSize: 13,
    fontWeight: '700',
  },
});
