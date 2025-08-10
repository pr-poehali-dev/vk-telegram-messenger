import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import CountrySelect from '@/components/ui/country-select';
import { countries, Country, validatePhoneNumber, formatPhoneNumber } from '@/data/countries';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUsername = localStorage.getItem('lastUsername');
    if (savedUsername && !isSignUp) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
    }
  }, [isSignUp]);

  const { signUp, signIn } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          return;
        }

        if (formData.password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          return;
        }

        if (!formData.username.trim()) {
          setError('Введите имя пользователя');
          return;
        }

        if (!formData.phone.trim()) {
          setError('Введите номер телефона');
          return;
        }

        if (!validatePhoneNumber(formData.phone, selectedCountry)) {
          setError(`Неверный формат номера для ${selectedCountry.name}`);
          return;
        }

        const fullPhone = selectedCountry.dialCode + formData.phone.replace(/\D/g, '');
        const { error } = await signUp(fullPhone, formData.username, formData.password);
        if (error) {
          setError(error);
        } else {
          localStorage.setItem('lastUsername', formData.username);
        }
      } else {
        if (!formData.username.trim()) {
          setError('Введите имя пользователя');
          return;
        }

        if (!formData.password.trim()) {
          setError('Введите пароль');
          return;
        }

        const { error } = await signIn(formData.username, formData.password);
        if (error) {
          setError(error);
        } else {
          localStorage.setItem('lastUsername', formData.username);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-4 shadow-lg">
            💬
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isSignUp ? 'Регистрация' : 'Вход в Messenger'}
          </CardTitle>
          <p className="text-slate-600 text-sm">
            {isSignUp 
              ? 'Создайте аккаунт для общения с друзьями' 
              : 'Войдите в свой аккаунт'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <div className="flex gap-2">
                  <CountrySelect
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    countries={countries}
                  />
                  <div className="relative flex-1">
                    <Icon name="Phone" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="999 999 9999"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      required={isSignUp}
                    />
                  </div>
                </div>
                {formData.phone && !validatePhoneNumber(formData.phone, selectedCountry) && (
                  <p className="text-xs text-red-600">
                    Требуется {selectedCountry.phoneLength.join(' или ')} цифр для {selectedCountry.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <div className="relative">
                <Icon name="User" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <Icon name="AlertCircle" size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isSignUp ? 'Создание аккаунта...' : 'Вход...'}
                </div>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <Icon name="UserPlus" size={18} className="mr-2" />
                      Создать аккаунт
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" size={18} className="mr-2" />
                      Войти
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-slate-600 text-sm">
              {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({
                  phone: '',
                  username: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              className="mt-1 text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {isSignUp ? 'Войти в существующий аккаунт' : 'Создать новый аккаунт'}
            </Button>
          </div>

          {isSignUp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-blue-700 text-xs">
                  <p className="font-medium mb-1">Требования к аккаунту:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Уникальное имя пользователя</li>
                    <li>Пароль минимум 6 символов</li>
                    <li>Номер телефона для восстановления</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;