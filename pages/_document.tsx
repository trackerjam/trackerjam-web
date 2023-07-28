import * as React from 'react';
import Document, {Head, Html, Main, NextScript} from 'next/document';
import {Provider as StyletronProvider} from 'styletron-react';
import {Server} from 'styletron-engine-atomic';
import {styletron} from '../styletron';

class MyDocument extends Document<{stylesheets: any[]}> {
  static async getInitialProps(context: any) {
    const renderPage = () =>
      context.renderPage({
        // eslint-disable-next-line react/display-name
        enhanceApp: (App: any) => (props: any) => (
          <StyletronProvider value={styletron}>
            <App {...props} />
          </StyletronProvider>
        ),
      });

    const initialProps = await Document.getInitialProps({
      ...context,
      renderPage,
    });
    const stylesheets = (styletron as Server).getStylesheets() || [];
    return {...initialProps, stylesheets};
  }

  render() {
    return (
      <Html>
        <Head>
          {this.props.stylesheets.map((sheet, i) => (
            <style
              className="_styletron_hydrate_"
              dangerouslySetInnerHTML={{__html: sheet.css}}
              media={sheet.attrs.media}
              data-hydrate={sheet.attrs['data-hydrate']}
              key={i}
            />
          ))}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
