import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import google from 'next-auth/providers/google';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      let isLoggedIn = false;
      isLoggedIn = !!auth?.user;
      const isOnBotPage = nextUrl.pathname.startsWith('/bot');
      
      if (isOnBotPage) {
        return isLoggedIn; // Yalnızca oturum açıldıysa erişime izin ver
      }
      return true; // Diğer sayfalara erişime izin ver
    },
    async redirect({ url, baseUrl }) {
      // Kullanıcı oturum açtıysa ve /bot sayfasına gitmek istiyorsa yönlendirme yapılacak
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  providers: [GitHub, Google],
};


/*let isLoggedIn = false;
      isLoggedIn = !!auth?.user;  */