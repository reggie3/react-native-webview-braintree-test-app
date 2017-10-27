import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import WebViewBraintree from 'react-native-webview-braintree/WebViewBraintree';
import * as brainTreeUtils from './braintreeUtils';
import renderIf from 'render-if';

const inventory = [
  {
    ID: 1,
    name: 'tooth brushes',
    description: 'dental',
    price: '1.99'
  },
  {
    ID: 2,
    name: 'dental floss',
    description: 'dental',
    price: '3.99'
  },
  {
    ID: 3,
    name: 'baby oil',
    description: 'childcare',
    price: '3.50'
  },
  {
    ID: 4,
    name: 'marshmallows',
    description: 'snacks',
    price: '1.99'
  }
];

let cart = {
  totalPrice: 100.0,
  items: []
};

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      clientToken: '',
      paymentAPIResponse: ''
    };
  }

  componentDidMount = () => {
    brainTreeUtils
      .getClientToken({
        merchantAccountID: null,
        customerID: null
      })
      .then(response => {
        // console.log({ response });
        if (response.type === 'success') {
          let clientToken = response.response.result.clientToken;
          this.setState({
            clientToken
          });
        }
      });
  };

  /******
   * called by BraintreePaymentWebview once a nonce is recieved by
   * the webview and posts the purchase to the applicationServer
   */
  handlePaymentMethod = nonce => {
    // make api call to purchase the item using the nonce received
    // from BraintreeWebView Component
    console.log("-------handlePaymentMethod-------");
    console.log(`nonce: ${nonce}`);
    console.log(`totalPrice: ${cart.totalPrice}`);
    brainTreeUtils
      .postPurchase(nonce, cart.totalPrice, {})
      .then(response => {
        console.log({ response });
        if (response.type === 'success') {
          this.setState({ paymentAPIResponse: 'PAYMENT_SUCCESS' });
          console.log('Payment was successful.');
        } else {
          this.setState({ paymentAPIResponse: 'PAYMENT_REJECTED' });
        }
      });
  };

  purchaseCompleteCallback = response => {
    console.log('purchaseCompleteCallback');
  };

  // enables payment webview to display a button that navigates back
  // to home page even though it doesn't have access to router
  navigationBackCallback = () => {
    console.log('Navigation callback was successful.');
  };

  render() {
    return (
      <View
        style={{
          paddingVertical: 40,
          backgroundColor: `#ffffff`,
          flex: 1
        }}
      >
        <Text>Testing application for react-native-webview-braintree npm package</Text>
        {renderIf(this.state.clientToken === '')(
          <ActivityIndicator
            animating={true}
            style={[styles.centering, { height: 180 }]}
            size="large"
          />
        )}
        {renderIf(this.state.clientToken !== '')(
            <WebViewBraintree
              clientToken={this.state.clientToken}
              nonceObtainedCallback={this.handlePaymentMethod}
              navigationBackCallback={this.navigationBackCallback}
              paymentAPIResponse={this.state.paymentAPIResponse}
            />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
