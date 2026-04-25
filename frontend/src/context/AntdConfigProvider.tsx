'use client';
import { useTheme } from '@/context/ThemeContext';
import { ConfigProvider, theme } from 'antd';

const AntdConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: currentTheme } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          Table: {
            borderColor: currentTheme === 'dark' ? '#444' : '#e2d5c2',
          },
          Pagination: {
            itemActiveBg: '#cb0c9f',
            itemActiveColor: '#fff',
            
            itemActiveColorHover: '#fff',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;
