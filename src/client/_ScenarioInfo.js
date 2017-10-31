"use strict";

class ScenarioInfo {
  get users() {
    return this._users;
  }
  
  set users(value) {
    this._users = value;
  }
  
  get socket() {
    return this._socket;
  }
  
  set socket(value) {
    this._socket = value;
  }
  get name() {
    return this._name || '';
  }
  
  set name(value) {
    window.document.title = value || 'Mabo';
    history.pushState(null, null, (this.id !== '') ? `mabo/${this.id}` : '/');
    this._name            = value;
  }
  
  get id() {
    return this._id || '';
  }
  
  set id(_id) {

    this._id = _id;
  }
  
  constructor() {
    if (typeof ScenarioInfo.instance === 'object') {
      return ScenarioInfo.instance
    }
    ScenarioInfo.instance = this;
    
    const SOCKET_EP = process.env.SOCKET_EP;
  
    this._socket = io(SOCKET_EP);
    this._id     = '';
    this._name   = '';
    this._users  = [];
    this.name    = 'Mabo';
  }
}

module.exports = ScenarioInfo;