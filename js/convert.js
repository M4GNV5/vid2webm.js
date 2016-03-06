var filesIn = document.getElementById("fileInput");
var fpsIn = document.getElementById("fpsInput");
var qualityIn = document.getElementById("qualityInput");
var sizeIn = document.getElementById("sizeInput");

var output = document.getElementById("output");
var progress = document.getElementById("progress");
var vid = document.getElementById("vid");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function doDaMagic()
{
	if(!filesIn.files[0])
	{
		output.innerHTML = "Error: no file selected";
		return;
	}

	var file = filesIn.files[0];
	var canPlay = vid.canPlayType(file.type);
	var fileURL = URL.createObjectURL(file);

	if(!canPlay || canPlay == "no")
	{
		output.innerHTML = "Error: unsupported file type: " + file.type;
		return;
	}

	var fps = Number(fpsIn.value);
	var step = 1000 / fps / 1000;
	var quality = Number(qualityIn.value);

	vid.addEventListener("canplay", startConverting);
	vid.src = fileURL;

	function startConverting()
	{
		vid.removeEventListener("canplay", startConverting);

		if(sizeIn.value == "source")
			sizeIn.value = [vid.videoWidth, "x", vid.videoHeight].join("");

		var size = sizeIn.value.split("x");
		var width = canvas.width = Number(size[0]);
		var height = canvas.height = Number(size[1]);

		if(!fps || !quality || !width || !height)
		{
			output.innerHTML = "Error: invalid input";
			return;
		}

		var webm = new Whammy.Video(fps, quality);
		var time = 0;
		var duration = progress.max = vid.duration;

		vid.addEventListener("timeupdate", processFrame);
		vid.currentTime = time;

		function processFrame()
		{
			ctx.drawImage(vid, 0, 0, width, height);
			webm.add(canvas);
			progress.value = time;

			time += step;
			if(time < duration)
				vid.currentTime = time;
			else
				finish();
		}

		function finish()
		{
			vid.removeEventListener("timeupdate", processFrame);

			var blob = webm.compile();
			var url = URL.createObjectURL(blob);
			var a = document.createElement("a");
			a.href = url;
			a.download = file.name.substr(0, file.name.lastIndexOf(".")) + ".webm";
			a.click();
		}
	}
}
