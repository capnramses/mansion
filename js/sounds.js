// Note:
// self._loaded is the property you want
// could do 3d audio with .pos3d()

var sounds = new Object ();

function start_loading_sounds () {
	// buffer property forces buffered html5 audio for larger files
	sounds.title_music = new Howl ({
		autoplay: false,
		buffer: true,
		urls: ['audio/toccata.ogg'],
		onload: function () { console.log ("sound loaded: title"); }
	});
	sounds.hatchet = new Howl ({
		autoplay: false,
		urls: ['audio/hatchet.wav'],
		onload: function () { console.log ("sound loaded: hatchet"); }
	});
	sounds.zombie_growl = new Howl ({
		autoplay: false,
		urls: ['audio/sfxr_there_he_is.wav'],
		onload: function () { console.log ("sound loaded: zombie_growl"); }
	});
	sounds.zombie_punch = new Howl ({
		autoplay: false,
		urls: ['audio/sfxr_hit.wav'],
		onload: function () { console.log ("sound loaded: zombie_punch"); }
	});
	sounds.get_key = new Howl ({
		autoplay: false,
		urls: ['audio/sfxr_key.wav'],
		onload: function () { console.log ("sound loaded: key"); }
	});
	sounds.get_crown = new Howl ({
		autoplay: false,
		urls: ['audio/crown.wav'],
		onload: function () { console.log ("sound loaded: crown"); }
	});
	sounds.open_door = new Howl ({
		urls: ['audio/sfxr_secret.wav'],
		onload: function () { console.log ("sound loaded: door open"); }
	});
	sounds.hit_zomb = new Howl ({
		urls: ['audio/hit_zomb.wav'],
		onload: function () { console.log ("sound loaded: hit zomb"); }
	});
	sounds.zomb_die = new Howl ({
		urls: ['audio/zomb_die.wav'],
		onload: function () { console.log ("sound loaded: zomb_die"); }
	});
	sounds.medkit = new Howl ({
		urls: ['audio/medkit.wav'],
		onload: function () { console.log ("sound loaded: medkit"); }
	});
	sounds.get_shotgun = new Howl ({
		urls: ['audio/get_shotgun.wav'],
		onload: function () { console.log ("sound loaded: get_shotgun"); }
	});
	sounds.shotgun = new Howl ({
		urls: ['audio/shotgun.wav'],
		onload: function () { console.log ("sound loaded: shotgun"); }
	});
}
