RTA.clients.qBittorrentV2Adder = function(server, data, torrentname, label, dir) {
	console.log('COUCOU');
	console.log('server:: ', server);
	var rootUrl = (server.hostsecure ? "https" : "http") + "://" + server.host + ":" + server.port;

	// execute login request
	fetch(rootUrl + "/api/v2/auth/login", {
		method: 'POST',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		},
		body: "username=" + encodeURIComponent(server.login) + "&password=" + encodeURIComponent(server.password)
	})
	.then(RTA.handleFetchError)
	.then(response => response.text())
	.then(text => {
		if(text != "Ok.") {
			RTA.displayResponse("Failure", "Login to " + server.name + "'s WebUI failed.", true);
		} else {
			// prepre post body
			var message = new FormData();

			if(data.substring(0,7) == "magnet:") {
				message.append("urls", data)
			} else {
				const dataBlob = RTA.convertToBlob(data, "application/x-bittorrent");
				const myName = ((torrentname.length && torrentname.length > 1) ? torrentname : (new Date).getTime());
				message.append("fileselect[]", dataBlob, myName);
			}

			if(dir) {
				message.append("savepath", dir);
			}

			if(server.tags) {
				message.append("tags", server.tags);
			}

			if(server.category) {
				message.append("category", server.category);
			}

			if(server.forcestart) {
				message.append("paused", false);
			}

			// add the torrent
			fetch(rootUrl + "/api/v2/torrents/add", {
				method: 'POST',
				body: message
			})
			.then(RTA.handleFetchError)
			.then(response => response.text())
			.then(addText => {
				if(addText != "Ok.") {
					RTA.displayResponse("Failure", "Adding the torrent failed:\n" + addText, true);
				} else {
					RTA.displayResponse("Success", "Torrent added successfully to " + server.name + ".");
				}
			})
			.catch(error => {
				RTA.displayResponse("Failure", "Could not contact " + server.name + "\nError: " + error.message, true);
			});
		}
	})
	.catch(error => {
		RTA.displayResponse("Failure", "Could not contact " + server.name + "\nError: " + error.message, true);
	});
};