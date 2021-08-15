// Remove the following lines, if you do not need any of Bootstrap's JavaScript features
import Popper from 'popper.js';
window.jQuery = $;
window.$ = $;

require("bootstrap");

import "regenerator-runtime/runtime";
import IPFS from 'ipfs';
// import OrbitDB from 'orbit-db';
// import { nanoid } from 'nanoid';
import { formatDistance } from 'date-fns';
import EasyIdentity from '@dunp/identity/easy';
import Web3Identity from '@dunp/identity/web3';
import Data from '@dunp/data';


// App ID for dunp
const APP_ID = process.env.APP_ID || 'test-app';
const APP_IDENTITY = process.env.APP_IDENTITY || '0x1C01Ff00f9d3d7F403A22b22aA7829c1Cb235339';
const TEST_IDENTITY = '0xb22aA7829c1Cb2353391C01Ff00f9d3d7F403A22';

// Create IPFS instance
const startIPFS = async () => {
  return IPFS.create(Data.DEFAULT_OPTIONS.config.ipfs);
};

// Handle Login
const handleLogin = async (e) => {
  e.preventDefault();

  const username = $('#username').val();
  const password = $('#password').val();
  const identity = await EasyIdentity.login({username, password});
  console.log('dunp identity created', identity);

  $('#did').val(identity.id);
  $('#logout').attr('disabled', false);

  // Continue to Data
  startData(identity);
}

// Handle Connect
const handleConnect = async (e) => {
  e.preventDefault();

  await window.ethereum.enable();

  const identity = await Web3Identity.login();
  console.log('dunp identity created', identity);

  $('#did').val(identity.id);
  $('#logout').attr('disabled', false);

  // Continue to Data
  startData(identity);
}

// Handle Logout
const handleLogout = async (e) => {
  e.preventDefault();

  const identity = await EasyIdentity.logout();
  console.log('dunp logged out');

  $('#did').val('');
  $('#logout').attr('disabled', true);

  cleanup();
}

// Create Data instance
const startData = async (identity) => {
  window.data = await Data.create(APP_ID, identity, { ipfs: window.ipfs });
  console.log('Data instance created', window.data);

  window.orbitdb = window.data.orbitdb;

  // window.settings = await window.data.settings(APP_IDENTITY);
  // window.settings.on('notify', (name, address) => console.log(`Got more entries on '${name}' store`));

  // console.log(settings.all());

  // Enable things if test account
  if (identity.id === TEST_IDENTITY) {
    $('#profile-action').html('Update profile');
    $('#name').attr('disabled', false);
    $('#bio').attr('disabled', false);
    $('#location').attr('disabled', false);
    $('#saveprofile').attr('disabled', false);
    $('#postform').attr('style', 'display: block');
  }

  // Open profile
  if (identity.id === TEST_IDENTITY)
    window.profile = await window.data.profile();
  else    // Profile from address
    window.profile = await window.data.profileFromAddress('/orbitdb/zdpuAkbVDDvUQjzZRba6rRsvP6JN1THdQJfnKeZDo66ks4k3N/dunp.profile');
  console.log('dunp profile instance', window.profile);
  
  window.profile.on('notify', (name, address) => showProfile());
  showProfile();

  // Open a portfolio for posts content
  if (identity.id === TEST_IDENTITY)
    window.posts = await window.data.portfolio('post');
  else
    window.posts = await window.data.portfolioFromAddress('/orbitdb/zdpuAzJpACLEHzXMqG852iM7oGmv4noXy25rqJ3JcR1q2bdHZ/dunp.post');
  console.log('dunp posts portfolio instance', window.posts);

  window.posts.on('notify', (name, address) => showPosts());
  showPosts();
};

const showProfile = () => {
  const profile = window.profile.get('default');

  if (profile) {
    $('#avatar').attr('src', `https://robohash.org/${profile.id}.png?bgset=bg2`);
    $('#name').val(profile.name);
    $('#bio').val(profile.bio);
    $('#location').val(profile.location);
  }
  console.log('profile shown');
};

const handleSaveProfile = async (e) => {
  e.preventDefault();

  var profile = window.profile.get('default');

  if (profile) {
    delete profile._id;
  } else {
    profile = {
      version: '0.0.1',
      created: Date.now(),
      publish: true,
    };
  }

  profile.name = $('#name').val();
  profile.bio = $('#bio').val();
  profile.location = $('#location').val();
  profile.updated = Date.now();
  await window.profile.set('default', profile);
  
  console.log('profile saved');

  showProfile();
}

const showPosts = () => {
  const profile = window.profile.get('default');
  const posts = window.posts.all().reverse();

  var html = '';
  if (!posts.length) {
    html = '<span class="light-small">no posts yet...</span>';
  } else {
    posts.map(post => {
      html += `<li class="list-group-item">
        <div class="media">
          <div class="media-left">
            <img class="avatar" src="https://robohash.org/${profile.id}.png?bgset=bg2" alt="${profile.name}" title="${profile.name} avatar">
          </div>
          <div class="media-body">
            <small class="text-muted float-right">${formatDistance(new Date(post.created), new Date(), { addSuffix: true })}</small>
            <strong class="media-heading">${profile.name}</strong>
            <div>${post.summary}</div>
          </div>
        </div>
      </li>`;
    });
  }
  $("#posts").html(html);

  console.log('posts shown');
};

const handlePost = async (e) => {
  e.preventDefault();

  // Get message
  const message = $('#message').val();
  if (!message || message.length === 0) return;

  // Create a post
  const hash = await window.posts.add({
    version: '0.0.1',
    created: Date.now(),
    updated: Date.now(),
    publish: true,
  
    summary: message
  });
  // Clean form
  $('#message').val('');

  console.log('update', hash, 'posted');

  showPosts();
};

const cleanup = () => {
  // Disable things for test account
  $('#profile-action').html('View profile');
  $('#name').attr('disabled', true);
  $('#bio').attr('disabled', true);
  $('#location').attr('disabled', true);
  $('#saveprofile').attr('disabled', true);
  $('#postform').attr('style', 'display: none');
  // Profile form
  $('#avatar').attr('src', `https://azcast.arizona.edu/sites/default/files/profile-blank.png`);
  $('#name').val('');
  $('#bio').val('');
  $('#location').val('');
  // Feed form
  $('#message').val('');
  // Posts
  $('#posts').html('<span class="light-small">no posts yet...</span>');
};

const main = async () => {
  console.log('Sarting IPFS node...');

  window.ipfs = await startIPFS();
  const { id } = await window.ipfs.id();
  console.log('IPFS node', id, 'started');

  $('#node').val(id);

  $('#login').on('click', handleLogin);
  $('#connect').on('click', handleConnect);
  $('#logout').on('click', handleLogout);
  $('#saveprofile').on('click', handleSaveProfile);
  $('#post').on('click', handlePost);
}

window.addEventListener('load', main);