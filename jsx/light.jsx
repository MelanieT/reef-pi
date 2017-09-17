import React from 'react'
import $ from 'jquery'
import LEDChannel from './led_channel.jsx'

export default class Light extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      channels: {},
      fixed: {},
      updated: false
    }
    this.updateValues = this.updateValues.bind(this)
    this.getValues = this.getValues.bind(this)
    this.channelList = this.channelList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.setLightMode = this.setLightMode.bind(this)
    this.updateLight = this.updateLight.bind(this)
    this.updateChannel = this.updateChannel.bind(this)
  }

  updateLight () {
    $.ajax({
      url: '/api/lights/' + this.props.id,
      type: 'POST',
      data: JSON.stringify({
        name: this.props.name,
        channels: this.state.channels,
        jack: this.props.jack
      }),
      success: function (data) {
        this.fetchData()
        this.setState({updated: false})
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setLightMode (pin) {
    return (function (ev) {
      var channels = this.state.channels
      channels[pin].auto = ev.target.checked
      this.setState({
        channels: channels,
        updated: true
      })
    }.bind(this))
  }

  componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    $.ajax({
      url: '/api/lights/' + this.props.id,
      type: 'GET',
      success: function (data) {
        this.setState({
          channels: data.channels,
          jack: data.jack
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  getValues (pin) {
    return (
      function () {
        return this.state.channels[pin].values
      }.bind(this)
    )
  }

  updateValues (pin, values) {
    var channels = this.state.channels
    channels[pin].values = values
    this.setState({
      channels: channels,
      updated: true
    })
  }

  updateChannel (pin) {
    return (
      function (ch) {
        var channels = this.state.channels
        channels[pin] = ch
        this.setState({
          channels: channels,
          updated: true
        })
      }.bind(this)
    )
  }

  channelList () {
    var channelUIs = []
    for (var pin in this.state.channels) {
      var ch = this.state.channels[pin]
      channelUIs.push(
        <div className='container' key={this.props.name + '-' + ch.name}>
          <LEDChannel pin={pin} name={ch.name} onChange={this.updateValues} ch={ch} updateChannel={this.updateChannel(pin)} />
        </div>
      )
    }
    return channelUIs
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return (
      <div className='container'>
        <div className='row'>
          {this.props.name}
        </div>
        <div className='row'>
          { this.channelList() }
        </div>
        <div className='row'>
          <input type='button' id={'update-light-' + this.props.name} onClick={this.updateLight} value='update' className={updateButtonClass} />
        </div>
      </div>
    )
  }
}
