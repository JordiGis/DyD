import localforage from 'localforage';

localforage.config({
  name: 'DyDCharacterStates',
  storeName: 'character_states',
  description: 'Storage for character states and images'
});

export default localforage;
