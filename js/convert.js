var filesIn = document.getElementById("fileInput");
var fpsIn = document.getElementById("fpsInput");
var qualityIn = document.getElementById("qualityInput");
var sizeIn = document.getElementById("sizeInput");

var progress = document.getElementById("progress");
var vid = document.getElementById("vid");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function doDaMagic()
{
	if(!filesIn.files[0])
	{
		progress.innerHTML = "Error: no file selected";
		return;
	}

	var file = filesIn.files[0];
	var canPlay = vid.canPlayType(file.type);
	var fileURL = URL.createObjectURL(file);

	var fps = Number(fpsIn.value);
	var step = 1000 / fps / 1000;
	var quality = Number(qualityIn.value);
	var size = sizeIn.value.split("x");
	var width = canvas.width = Number(size[0]);
	var height = canvas.height = Number(size[1]);

	if(!canPlay || canPlay == "no")
	{
		progress.innerHTML = "Error: unsupported file type: " + file.type;
		return;
	}
	if(!fps || !quality || !width || !height)
	{
		progress.innerHTML = "Error: invalid input";
		return;
	}

	vid.addEventListener("canplay", startConverting);
	vid.src = fileURL;

	function startConverting()
	{
		vid.removeEventListener("canplay", startConverting);

		var webm = new Whammy.Video(fps, quality);
		var time = 0;
		var duration = vid.duration;

		vid.addEventListener("timeupdate", processFrame);
		vid.currentTime = time;

		function processFrame()
		{
			ctx.drawImage(vid, 0, 0, width, height);
			webm.add(canvas);
			var percentage = Math.round(time / duration * 100);
			progress.innerHTML = "Progress: " + percentage + "%";

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
