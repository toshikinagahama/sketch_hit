import '../styles/globals.css';
import { RecoilRoot } from 'recoil';

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

MyApp.getInitialProps = async () => ({ pageProps: {} });
export default MyApp;
