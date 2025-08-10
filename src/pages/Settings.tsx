import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const Settings = ({ onBack }: { onBack: () => void }) => {
  const { userProfile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    password: '',
    confirmPassword: '',
    theme: userProfile?.theme || 'light'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleThemeChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      theme: checked ? 'dark' : 'light'
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = {};

      // Проверяем изменение username
      if (formData.username !== userProfile?.username) {
        if (!formData.username.trim()) {
          setError('Имя пользователя не может быть пустым');
          return;
        }
        updates.username = formData.username.trim();
      }

      // Проверяем изменение темы
      if (formData.theme !== userProfile?.theme) {
        updates.theme = formData.theme;
      }

      // Проверяем изменение пароля
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          return;
        }
        // TODO: Добавить смену пароля через Supabase Auth
      }

      if (Object.keys(updates).length === 0) {
        setError('Нет изменений для сохранения');
        return;
      }

      const { error: updateError } = await updateProfile(updates);
      if (updateError) {
        setError(updateError);
      } else {
        setSuccess('Настройки успешно сохранены!');
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (error) {
      setError('Произошла ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: userProfile?.username || '',
      password: '',
      confirmPassword: '',
      theme: userProfile?.theme || 'light'
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        </div>

        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={20} />
                Профиль
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon name={isEditing ? "X" : "Edit"} size={16} className="mr-1" />
                {isEditing ? 'Отмена' : 'Редактировать'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white font-medium">
                {userProfile?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  @{userProfile?.username}
                </h3>
                <p className="text-sm text-gray-500">
                  {userProfile?.phone}
                </p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <div className="relative">
                <Icon name="User" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password (only when editing) */}
            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Новый пароль (оставьте пустым, если не хотите менять)</Label>
                  <div className="relative">
                    <Icon name="Lock" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Новый пароль"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <div className="relative">
                    <Icon name="Lock" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Подтвердите пароль"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Palette" size={20} />
              Внешний вид
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Темная тема</Label>
                <p className="text-sm text-gray-500">
                  Переключиться на темное оформление
                </p>
              </div>
              <Switch
                checked={formData.theme === 'dark'}
                onCheckedChange={handleThemeChange}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name={formData.theme === 'dark' ? 'Moon' : 'Sun'} size={20} />
                <span className="text-sm font-medium">
                  {formData.theme === 'dark' ? 'Темная тема' : 'Светлая тема'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" size={20} />
              Конфиденциальность и безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Key" size={16} className="mr-2" />
                Сменить пароль
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт данных
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <Icon name="UserX" size={16} className="mr-2" />
                Удалить аккаунт
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <Icon name="AlertCircle" size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 mb-4">
            <Icon name="CheckCircle" size={18} className="text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Сохранение...
                </div>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        )}

        {/* Logout */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;