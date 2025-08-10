import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Settings from './Settings';

const Index = () => {
  const { userProfile, signOut, user } = useAuth();
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { id: 'chats', label: 'Чаты', icon: 'MessageCircle' },
    { id: 'contacts', label: 'Контакты', icon: 'Users' },
    { id: 'calls', label: 'Звонки', icon: 'Phone' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' }
  ];

  // Загружаем чаты пользователя
  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  // Загружаем сообщения выбранного чата
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadUserChats = async () => {
    try {
      const { data: chats, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats (
            id,
            name,
            is_group,
            updated_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error loading chats:', error);
        return;
      }

      // Получаем информацию о собеседниках для личных чатов
      const enrichedChats = await Promise.all(
        (chats || []).map(async (chatData: any) => {
          const chat = chatData.chats;
          
          if (!chat.is_group) {
            // Для личных чатов находим собеседника
            const { data: participants } = await supabase
              .from('chat_participants')
              .select('user_id, user_profiles(username, avatar_url)')
              .eq('chat_id', chat.id)
              .neq('user_id', user?.id);

            if (participants && participants.length > 0) {
              const otherUser = participants[0].user_profiles;
              return {
                id: chat.id,
                name: otherUser?.username || 'Неизвестный',
                avatar: '👤',
                isGroup: false,
                updated_at: chat.updated_at
              };
            }
          }

          return {
            id: chat.id,
            name: chat.name || 'Группа',
            avatar: '👥',
            isGroup: true,
            updated_at: chat.updated_at
          };
        })
      );

      setUserChats(enrichedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          user_profiles(username)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setChatMessages(messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleUserSearch = async () => {
    if (!searchUser.trim()) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, phone, avatar_url')
        .ilike('username', `%${searchUser}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const startChat = async (otherUserId: string) => {
    try {
      // Проверяем есть ли уже чат между пользователями
      const { data: existingChats, error: chatError } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner(id, is_group)
        `)
        .eq('user_id', user?.id)
        .eq('chats.is_group', false);

      if (chatError) {
        console.error('Chat check error:', chatError);
        return;
      }

      let chatId = null;

      // Проверяем каждый чат на наличие второго участника
      if (existingChats && existingChats.length > 0) {
        for (const chat of existingChats) {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.chat_id);

          if (participants && participants.length === 2 && 
              participants.some(p => p.user_id === otherUserId)) {
            chatId = chat.chat_id;
            break;
          }
        }
      }

      // Если чата нет, создаем новый
      if (!chatId) {
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            is_group: false,
            created_by: user?.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Chat creation error:', createError);
          return;
        }

        chatId = newChat.id;

        // Добавляем участников
        await supabase
          .from('chat_participants')
          .insert([
            { chat_id: chatId, user_id: user?.id, role: 'admin' },
            { chat_id: chatId, user_id: otherUserId, role: 'member' }
          ]);
      }

      setSelectedChat(chatId);
      setSearchUser('');
      setSearchResults([]);
      await loadUserChats(); // Обновляем список чатов
    } catch (error) {
      console.error('Start chat error:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat,
          sender_id: user?.id,
          content: message.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Send message error:', error);
        return;
      }

      setMessage('');
      await loadChatMessages(selectedChat);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const renderSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            Messages
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Icon name="Search" size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-red-600 hover:text-red-700"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
        
        {userProfile && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {userProfile.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">@{userProfile.username}</h3>
              <p className="text-sm text-gray-500">Онлайн</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-2 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-1">
          {menuItems.slice(0, 3).map(item => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === 'settings') {
                  setShowSettings(true);
                }
              }}
              className="flex flex-col h-12 text-xs"
            >
              <Icon name={item.icon} size={16} />
              <span className="mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {userChats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Пока нет чатов</p>
            </div>
          ) : (
            <div className="space-y-1">
              {userChats.map(chat => (
                <Card
                  key={chat.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedChat === chat.id ? 'bg-blue-50 border-blue-200' : 'border-gray-100'}`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {chat.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.isGroup ? 'Группа' : 'Личный чат'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChat = () => (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              👤
            </div>
            <div>
              <h2 className="font-medium text-gray-900">
                {userChats.find(c => c.id === selectedChat)?.name || 'Чат'}
              </h2>
              <p className="text-sm text-green-600">онлайн</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Icon name="Phone" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Video" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="MoreVertical" size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Пока нет сообщений</p>
              <p className="text-sm text-gray-400 mt-1">Начните беседу!</p>
            </div>
          ) : (
            chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender_id === user?.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Icon name="Paperclip" size={18} />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Напишите сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="pr-12"
            />
            <Button 
              size="sm" 
              onClick={sendMessage}
              disabled={!message.trim()}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-4xl text-white mb-6 mx-auto">
          💬
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {userProfile ? `Привет, @${userProfile.username}!` : 'Добро пожаловать!'}
        </h2>
        <p className="text-gray-600 mb-6">
          Найдите друзей по имени пользователя, чтобы начать общение
        </p>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Найти пользователей</h3>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Введите username..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
              />
            </div>
            <Button 
              onClick={handleUserSearch}
              disabled={searchLoading || !searchUser.trim()}
            >
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="Search" size={16} />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Найденные пользователи:</h4>
              {searchResults.map((foundUser: any) => (
                <div key={foundUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {foundUser.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">@{foundUser.username}</p>
                      <p className="text-xs text-gray-500">{foundUser.phone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startChat(foundUser.id)}
                  >
                    <Icon name="MessageCircle" size={16} className="mr-1" />
                    Чат
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchUser && searchResults.length === 0 && !searchLoading && (
            <p className="text-sm text-gray-500 text-center py-4">
              Пользователи не найдены
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen flex bg-white">
      {renderSidebar()}
      {selectedChat ? renderChat() : renderWelcome()}
    </div>
  );
};

export default Index;