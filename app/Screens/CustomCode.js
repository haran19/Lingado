import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage
} from 'react-native'
import SearchBar from '../Components/SearchBar'
import { Ionicons } from '@expo/vector-icons'
import { Constants, FacebookAds } from 'expo'
import * as Animatable from 'react-native-animatable'

export default class CustomCode extends Component {

  constructor(props) {
    super(props)
    this.state = {
      code: '',
      customCode: '',
      editing: false,
      user: null
    }
  }

  componentWillMount() {
    this.setState({ code: this.props.code })
    fetch(`https://lingado-6b296.firebaseio.com/users/${this.props.code}.json`)
      .then(response => response.json())
      .then(response => this.setState({ user: response }))
  }


  _paymentOption() {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Customizing your code</Text>
        <Text style={styles.text}>If you use Lingado a lot, then you will want to get a custom code. Your custom code can be any 4-digit alpha-numeric code as long as it has not been taken. You can either buy a custom code for $0.99 or get it for free by watching ads.</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.watch} onPress={() => {
            FacebookAds.InterstitialAdManager.showAd('244254139402281_244255342735494')
              .then(didClick => {this.setState({ editing: true })})
              .catch(error => {})
          }}>
            <Text>Watch ad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pay} onPress={() => {
            this.setState({ editing: true })
          }}>
            <Text>Pay $0.99</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.code}>{this.state.code}</Text>
      </View>
    )
  }

  _customizeCode() {
    return (
      <Animatable.View style={styles.container} animation="fadeInUp" duration={500}>
        <Text style={styles.heading}>Thank you!</Text>
        <Text style={styles.text}>Enter the code you would like to have.</Text>
        <View style={styles.search}>
          <SearchBar
            onChangeText={customCode => this.setState({ customCode })}
            value={this.state.customCode}
            onBlur={() => this._updateCode()}
            returnKeyType='done'
          />
          <Ionicons onPress={() => this._updateCode()} style={styles.icon} name='md-search' size={20} color="rgba(255, 255, 255, 0.4)" />
        </View>
        <Text style={styles.code}>{this.state.customCode}</Text>
      </Animatable.View>
    )
  }

  _updateCode() {
    fetch(`https://lingado-6b296.firebaseio.com/users/${this.state.customCode}.json`)
      .then(response => response.json())
      .then(response => {
        if (response != null) {
          alert('This code is taken, please try another.')
          return
        }
        // Import the user information to the new code
        fetch(`https://lingado-6b296.firebaseio.com/users/${this.state.customCode}.json`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.state.user)
        })
        .then(response => {
          // Delete the old code
          fetch(`https://lingado-6b296.firebaseio.com/users/${this.state.code}.json`, {
            method: 'DELETE'
          })
          .then(response => {
            // Update the local device code
            AsyncStorage.setItem('code', this.state.customCode)  
              .then(response => {
                this.props.navigator.popToTop()
            })    
          })
        })
        
        
      })
  }

  render() {
    return (
      <View style={styles.container}>
      { !this.state.editing 
        ? this._paymentOption()
        : this._customizeCode()
      }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203040',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    marginTop: 50,
    marginBottom: 30,
    fontSize: 28,
    color: '#eee'
  },
  text: {
    marginBottom: 25,
    color: '#eee',
    paddingHorizontal: 50,
  },
  buttons: {
    flexDirection: 'row'
  },
  watch: {
    margin: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 100,
    padding: 15,
    alignItems: 'center',
    width: 120,
  },
  pay: {
    margin: 15,
    backgroundColor: '#06ce97',
    borderRadius: 100,
    padding: 15,
    alignItems: 'center',
    width: 120,
  },
  code: {
    fontSize: 64,
    marginTop: 60,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  search: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: 40,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 5,
    paddingRight: 5,
    margin: 25,
  },
})