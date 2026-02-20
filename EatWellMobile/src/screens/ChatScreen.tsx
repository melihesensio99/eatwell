import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { chatService, ChatMessage } from '../services/chatService';

interface Props {
  navigation: any;
}

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Typing animasyonu
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      dotAnim.setValue(0);
    }
  }, [isTyping]);

  // SignalR bağlantısı
  useEffect(() => {
    let mounted = true;

    const setupConnection = async () => {
      chatService.onMessage((reply, timestamp) => {
        if (!mounted) return;
        const aiMessage: ChatMessage = {
          role: 'model',
          content: reply,
          timestamp: new Date(timestamp),
        };
        setMessages(prev => [...prev, aiMessage]);
      });

      chatService.onTyping((typing) => {
        if (!mounted) return;
        setIsTyping(typing);
      });

      chatService.onError((error) => {
        if (!mounted) return;
        const errorMessage: ChatMessage = {
          role: 'model',
          content: `⚠️ Hata: ${error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      });

      try {
        await chatService.connect();
        if (mounted) {
          setIsConnected(true);
          setIsConnecting(false);
        }
      } catch {
        if (mounted) {
          setIsConnecting(false);
          setMessages([{
            role: 'model',
            content: '❌ Sunucuya bağlanılamadı. Lütfen backend\'in çalıştığından emin olun.',
            timestamp: new Date(),
          }]);
        }
      }
    };

    setupConnection();

    return () => {
      mounted = false;
      chatService.disconnect();
    };
  }, []);

  // Yeni mesajda otomatik scroll
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !isConnected) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const deviceId = (await AsyncStorage.getItem('@device_id')) || 'anon';
      // Geçmişin son 10 mesajını gönder
      const history = [...messages, userMessage].slice(-10);
      await chatService.sendMessage(deviceId, text, history);
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: '⚠️ Mesaj gönderilemedi. Bağlantıyı kontrol edin.',
        timestamp: new Date(),
      }]);
    }
  }, [inputText, isConnected, messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubbleRow, isUser && styles.messageBubbleRowUser]}>
        {!isUser && <Text style={styles.avatarEmoji}>🤖</Text>}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.aiBubble, { backgroundColor: colors.backgroundCard, borderColor: colors.border }],
          ]}
        >
          <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : colors.textPrimary }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser && <Text style={styles.avatarEmoji}>👤</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Bağlantı durumu */}
      {isConnecting && (
        <View style={[styles.statusBar, { backgroundColor: colors.accentBlue + '20' }]}>
          <Text style={[styles.statusText, { color: colors.accentBlue }]}>⏳ Bağlanıyor...</Text>
        </View>
      )}

      {/* Mesaj listesi */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isConnecting ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🥗</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                EatWell Asistan
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Beslenme hakkında sorularınızı sorun!
              </Text>
              <View style={styles.suggestionsGrid}>
                {[
                  '🍎 Bugün ne kadar kalori aldım?',
                  '🥗 Sağlıklı atıştırmalık öner',
                  '💪 Protein ağırlıklı yemek öner',
                ].map((suggestion, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionChip, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                    onPress={() => {
                      setInputText(suggestion.slice(2).trim());
                    }}
                  >
                    <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {/* Typing indicator */}
      {isTyping && (
        <Animated.View style={[styles.typingRow, { opacity: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]}>
          <Text style={styles.typingAvatar}>🤖</Text>
          <View style={[styles.typingBubble, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Text style={[styles.typingText, { color: colors.textMuted }]}>Düşünüyor...</Text>
          </View>
        </Animated.View>
      )}

      {/* Input alanı */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() && isConnected ? colors.primary : colors.backgroundCard,
              borderColor: inputText.trim() && isConnected ? colors.primary : colors.border,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || !isConnected}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>
            {isConnected ? '➤' : '⏳'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  messageBubbleRowUser: {
    justifyContent: 'flex-end',
  },
  avatarEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: FontSize.xs - 1,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: 8,
  },
  typingAvatar: {
    fontSize: 20,
  },
  typingBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  typingText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: FontSize.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.lg,
  },
  suggestionsGrid: {
    gap: Spacing.sm,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});

export default ChatScreen;
