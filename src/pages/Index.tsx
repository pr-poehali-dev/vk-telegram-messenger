import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  const menuItems = [
    { id: 'chats', label: 'Чаты', icon: 'MessageCircle' },
    { id: 'contacts', label: 'Контакты', icon: 'Users' },
    { id: 'groups', label: 'Группы', icon: 'Users2' },
    { id: 'channels', label: 'Каналы', icon: 'Radio' },
    { id: 'calls', label: 'Звонки', icon: 'Phone' },
    { id: 'stories', label: 'История', icon: 'Play' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' }
  ];

  const chats = [
    { id: 1, name: 'Александра Петрова', message: 'Привет! Как дела? 😊', time: '14:32', unread: 2, online: true, avatar: '👩‍💼' },
    { id: 2, name: 'Team Developers', message: 'Михаил: Готов новый билд!', time: '13:45', unread: 5, isGroup: true, avatar: '💻' },
    { id: 3, name: 'Мама', message: 'Звонок пропущен', time: '12:15', unread: 1, missed: true, avatar: '👩‍👧' },
    { id: 4, name: 'Игорь Смирнов', message: 'Отправил фото', time: '11:23', unread: 0, online: false, avatar: '👨‍🔧' },
    { id: 5, name: 'Канал Новости', message: '🔥 Главные события дня', time: '10:45', unread: 12, isChannel: true, avatar: '📺' }
  ];

  const stories = [
    { id: 1, name: 'Моя история', avatar: '👤', hasStory: true, isOwn: true },
    { id: 2, name: 'Александра', avatar: '👩‍💼', hasStory: true },
    { id: 3, name: 'Team', avatar: '💻', hasStory: true },
    { id: 4, name: 'Игорь', avatar: '👨‍🔧', hasStory: true },
    { id: 5, name: 'Новости', avatar: '📺', hasStory: true }
  ];

  const messages = [
    { id: 1, text: 'Привет! Как проходит работа над проектом?', time: '14:30', isOwn: false },
    { id: 2, text: 'Отлично! Уже готов MVP версии 🚀', time: '14:31', isOwn: true },
    { id: 3, text: 'Здорово! Можешь показать что получилось?', time: '14:32', isOwn: false },
    { id: 4, text: 'Конечно! Вот ссылка на демо', time: '14:32', isOwn: true },
    { id: 5, text: '👍 Круто выглядит!', time: '14:33', isOwn: false }
  ];

  const renderSidebar = () => (
    <div className="w-80 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messenger
          </h1>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <Icon name="Search" size={20} />
          </Button>
        </div>
        
        {/* Stories */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stories.map(story => (
            <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
              <div className={`w-14 h-14 rounded-full p-0.5 ${story.hasStory ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-slate-300'} group-hover:scale-105 transition-transform`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xl">
                  {story.avatar}
                </div>
              </div>
              <p className="text-xs mt-1 text-slate-600 truncate w-14">{story.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2">
        <div className="grid grid-cols-4 gap-1">
          {menuItems.map(item => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col h-16 ${activeSection === item.id ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' : 'hover:bg-slate-200'} transition-all duration-200`}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {chats.map(chat => (
            <Card
              key={chat.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedChat === chat.id ? 'ring-2 ring-primary shadow-lg' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-lg">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                      <span className="text-xs text-slate-500">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate ${chat.missed ? 'text-red-500' : 'text-slate-600'}`}>
                        {chat.message}
                      </p>
                      {chat.unread > 0 && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChat = () => (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              👩‍💼
            </div>
            <div>
              <h2 className="font-semibold">Александра Петрова</h2>
              <p className="text-sm text-green-600">онлайн</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Icon name="Phone" size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Icon name="Video" size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.isOwn 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white ml-auto' 
                  : 'bg-white shadow-sm border border-slate-200'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hover:bg-accent/10">
            <Icon name="Paperclip" size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-accent/10">
            <Icon name="Smile" size={20} />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Написать сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-12 bg-slate-100 border-0 focus:bg-white transition-colors"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-accent/10">
            <Icon name="Mic" size={20} />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/10">
            📸 Камера
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-secondary/10">
            🎨 Стикеры
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-accent/10">
            📁 Файлы
          </Button>
          <Button variant="outline" size="sm" className="text-xs hover:bg-primary/10">
            🔒 Шифровать
          </Button>
        </div>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center animate-bounce-in">
        <div className="w-32 h-32 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-6xl text-white mb-6 mx-auto shadow-2xl">
          💬
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Добро пожаловать в Messenger!
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          Выберите чат слева, чтобы начать общение. Видеозвонки, стикеры, шифрование и многое другое ждут вас!
        </p>
        <div className="flex gap-4 justify-center">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform">
            <Icon name="MessageCircle" size={20} className="mr-2" />
            Начать чат
          </Button>
          <Button variant="outline" className="hover:bg-accent/10">
            <Icon name="Users" size={20} className="mr-2" />
            Найти друзей
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {renderSidebar()}
      {selectedChat ? renderChat() : renderWelcome()}
    </div>
  );
};

export default Index;