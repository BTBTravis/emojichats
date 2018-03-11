// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"
var vue = require("vue/dist/vue");

import e from "./emoji.json"
//console.log({"e": e});
let es = Object.keys(e).map(function (key) {
  return e[key];
});
console.log({"es": es});

let channel = socket.channel("demo:lobby", {})

let t = `
<div id="wrapper">
  <ul id="usergrid">
    <li v-for="(user,index) in users" class="user"  :style="{ 'background-color': colors[index] }">
      <ul class="feed" :ref="'feed' + index">
        <div>
          <li v-for="message in prettyMessages" :class="{ owned: message.user == index }" >
            <div class="message">
              <img v-for="emoji in message.prettyParts" :src="'/images/emoji/' + emoji + '.png'"  />
            </div>
            <div class="userDot" :style="{ 'background-color': colors[message.user] }"></div>
          </li>
        </div>
      </ul>
      <ul class="typing-feed"></ul>
      <div class="input-wrapper">
        <input v-model="users[index].message" v-on:keydown.9.prevent="nextHighlight(index)" v-on:keydown.enter.prevent="addWord(index)" >
        <div v-if="users[index].message.length > 0" class="helper">
          <div class="title"><p>Message Preview:</p></div>
          <div class="messagePreview">
            <img v-for="pemoji in messagePreviews[index]" :src="'/images/emoji/' + pemoji.code_points.base + '.png'"  />
          </div>
          <div class="title"><p>Searching for: {{searchTerms[index]}} </p></div>
          <div class="results">
            <div class="searchemoji" v-for="(emoji, emojiIndex) in searchResults[index]"  :class="{ hightlight: user.searchHighlight === emojiIndex }" >
              <img :src="'/images/emoji/' + emoji.code_points.base + '.png'"  />
              <p>{{emoji.shortname}}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
    <li id="bar"><h1>EmojiChats</h1><h3>Emoji Sent: {{messages.length}}</h3></li>
  </ul>
</div>
`
let users = [];
let userCount = 8;
for(let i = 0; i < userCount; i++) {
  users.push({
    message: '',
    searchHighlight: 0
  });
}
let vue_config = {
  el: '#app',
  template: t,
  data: {
    users: users,
    activeColor: 'red',
    message: 'Hello'
  },
  mounted: function () {
    console.log("MOUNTED");
    this.scrollBot();
  },
  methods: {
    nextHighlight: function (i) {
      let user = this.users[i];
      if(this.searchResults[i].length > user.searchHighlight) user.searchHighlight++;
      else user.searchHighlight = 0;
    },
    addWord: function (i) {
      let user = this.users[i];
      if(! this.searchResults[i]) {
        this.sendMessage(i);
        return false;
      }
      let result = this.searchResults[i][user.searchHighlight];
      let termRX = RegExp(':[a-z]+$','g');
      let newMessage = this.users[i].message.replace(termRX, function (match){
        return result.shortname;
      });
      this.users[i].message = newMessage;
      this.users[i].searchHighlight = 0;
    },
    sendMessage: function (i) {
      let user = users[i];
      if(this.messagePreviews[i].length < 1) return false;
      let message = this.messagePreviews[i].reduce(function (str, emoji) {
        return str + emoji.code_points.base + ',';
      },"");
      message = message.slice(0,-1);
      console.log({"message": message});
      channel.push('message', { user: i, message: message });
      user.message = "";
      //this.scrollBot();
    },
    scrollBot: function () {
      this.users.map(function (user, i) {
        this.$nextTick(function(){
          let el = this.$refs['feed' + i][0];
          el.scrollTop = el.scrollHeight;
          //console.log({"ref": this.$refs['feed' + i]});
        });
      }.bind(this));
    },
  },
  computed: {
    colors: function () {
      return this.users.map(function (user, i) {
        return 'hsl(' + i * (360/userCount) + ', 100%, 67%)';
      });
    },
    searchTerms: function () {
      return this.users.map(function (user) {
        let termRX = RegExp(':[a-z]+$','g');
        let term = user.message.match(termRX);
        if(!term) return "";
        term = term[0];
        return term;
      });
    },
    searchResults: function () {
      return this.searchTerms.map(function (term) {
        if(!term) return false;
        let searchRX = RegExp('^' + term, 'g');
        return es.filter(function (emojiObj) {
          return searchRX.test(emojiObj.shortname);
        });
      });
    },
    messagePreviews: function () {
      return this.users.map(function (user) {
        let parts = user.message.split(':'); // ':test::test:' -> ['','test','',test,'']
        parts = parts.filter(function (part) {
          return part.length > 0;
        });
        parts = parts.map(function (part) {
          return ":" + part + ":";
        });
        let emojis = parts.reduce(function (arr, part) {
          let emoji = es.filter(function (emojiObj) {
            return emojiObj.shortname === part;
          });
          if(emoji.length > 0) arr.push(emoji[0]);
          return arr;
        }, []);
        return emojis;
      });
    },
    prettyMessages: function () {
      return this.messages.map(function (m) {
        let parts = m.message.split(',');
        m.prettyParts = parts;
        return m;
      });
    }
  }
};

(function () {
  return new Promise(function(resolve, reject) {
    channel.join()
      .receive("ok", resp => { resolve(resp) })
      .receive("error", resp => { reject(resp) })
  })
  //.then(function () {
    //return new Promise(function(resolve, reject) {
      //setTimeout(resolve, 4000);
    //});
  //})
  .then(function (data) {
    vue_config.data.messages = data.data;
    console.log({"data": data});
    var vm = new vue(vue_config);
    //console.log({"data": data});
    channel.on("message", data => {
      console.log({"message": data});
      vm.messages.push(data);
      vm.scrollBot();
    })
  });
})();


