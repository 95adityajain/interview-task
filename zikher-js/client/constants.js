export const SEARCH_TYPE = {
  ALBUM: 'album',
  ARTIST: 'artist',
  PLAYLIST: 'playlist',
  TRACK: 'track'
};

export const FIELDS_TO_SHOW = {
  ALBUM: ['id','album_type','name',['array','artists','name'],'available_markets'],
  ARTIST: ['id','name','popularity',['followers','total'],'genres'],
  PLAYLIST:['id','name','collaborative',['tracks','total'],['owner','id']],
  TRACK: ['id','name','popularity','track_number','duration_ms','explicit','available_markets',['array','artists','name'],['album','name']]
};
