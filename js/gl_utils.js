// vao etc for a full-screen quad
var quad = new Object ();
var gl_width = 640; // 1024
var gl_height = 480; // 1024

function init_gl () {
	canvas = document.getElementById ("canvas");
	if (!canvas) {
		console.log ("ERROR: Could not fetch canvas");
		return false;
	}
	canvas.width = gl_width;
	canvas.height = gl_height;
	gl = canvas.getContext ("webgl");
	if (!gl) {
		console.log ("ERROR: Could not create GL context");
		canvas.width = 1;
		canvas.height = 1;
		var sorry_el = document.getElementById ("sorry_el");
		sorry_el.innerHTML = "<b>ERROR: Could not start WebGL</b>.<br />" +
			"Most browsers and devices support WebGL these days. If you're running" +
			" an old version of Internet Explorer or Safari then try Firefox or" +
			" Chrome.<br />Sometimes Chrome requires a close-and-restart after " +
			"watching videos. <br />This game has not been coded to support mobile" +
			" devices. <br />";
		sorry_el.style.visibility = "visible";
		return false;
	}

	gl.clearColor (0.0, 0.0, 0.0, 1.0);
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// set some GL states that I want to use for rendering
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.enable (gl.DEPTH_TEST);

	vao_ext = gl.getExtension ("OES_vertex_array_object");
	if (!vao_ext) {
		console.error ("ERROR: Browser does not support WebGL VAO extension");
		return false;
	}
	
	// set up a full screen quad VAO
	var vp = [
		-1.0, -1.0,
		1.0, -1.0,
		-1.0, 1.0,
		1.0, 1.0,
	];
	quad.vao = vao_ext.createVertexArrayOES ();
	vao_ext.bindVertexArrayOES (quad.vao);
	var vbo_vp = gl.createBuffer ();
	gl.bindBuffer (gl.ARRAY_BUFFER, vbo_vp);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (vp), gl.STATIC_DRAW);
	gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray (0);
	quad.pc = 4;
	quad.vao.loaded = true;
	
	return true;
}

function build_shader (vert_id, frag_id, attribs) {
	var el = document.getElementById (vert_id);
	var vs_str = el.innerHTML;
	el = document.getElementById (frag_id);
	var fs_str = el.innerHTML;

	var vs = gl.createShader (gl.VERTEX_SHADER);
	var fs = gl.createShader (gl.FRAGMENT_SHADER);
	gl.shaderSource (vs, vs_str);
	gl.shaderSource (fs, fs_str);
	gl.compileShader (vs);
	if (!gl.getShaderParameter (vs, gl.COMPILE_STATUS)) {
		console.error ("ERROR compiling vert shader. log: " +
			gl.getShaderInfoLog (vs));
	}
	gl.compileShader (fs);
	if (!gl.getShaderParameter (fs, gl.COMPILE_STATUS)) {
		console.error ("ERROR compiling frag shader. log: " +
			gl.getShaderInfoLog (fs));
	}
	var sp = gl.createProgram ();
	gl.attachShader (sp, vs);
	gl.attachShader (sp, fs);
	for (var i = 0; i < attribs.length; i++) {
		gl.bindAttribLocation (sp, i, attribs[i]);
	}
	gl.linkProgram (sp);
	if (!gl.getProgramParameter (sp, gl.LINK_STATUS)) {
		console.error ("ERROR linking program. log: " + gl.getProgramInfoLog (sp));
	}
	gl.validateProgram (sp);
	if (!gl.getProgramParameter(sp, gl.VALIDATE_STATUS)) {
		console.error ("ERROR validating program. log: " +
			gl.getProgramInfoLog (sp));
	}
	
	// put linking status in sp
	sp.linked = true;
	console.log ("shader linked (" + vert_id + ", " + frag_id + ")");
	
	return sp;
}

function load_texture (url, clamp, linear) {
	var texture = gl.createTexture();
	var image = new Image();
	image.onload = function () {
		gl.bindTexture (gl.TEXTURE_2D, texture);
		gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			image);
		if (clamp) {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		} else {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}
		if (linear) {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		} else {
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}
		//
		// add loaded to texture object
		texture.loaded = true;
		console.log ("texture loaded (" + url + ")");
	}
	image.src = url;
	return texture;
}

window.requestAnimFrame = (function() {
return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback, element) {
		return window.setTimeout (callback, 1000 / 60);
	};
})();
