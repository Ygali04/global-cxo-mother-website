'use client';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import Preloader from '@/components/common/Preloader';

export default function Providers({ children }: { children: React.ReactNode }) {
   return (
      <Provider store={store}>
         <Preloader />
         {children}
      </Provider>
   );
}