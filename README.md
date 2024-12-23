# Spotify Sectionize
Find sections of a Spotify playlist

Given a playlist with track names like this:
```
Mini-Hopp på Cirkus - Del.1
Mini-Hopp på Cirkus - Del.2
Mini-Hopp på Cirkus - Del.3
Bamse och regnbågsnuttarna - Del.1
Bamse och regnbågsnuttarna - Del.2
Bamse och regnbågsnuttarna - Del.3
Bamse och regnbågsnuttarna - Del.4
Nalle-Maja och Grävla Grävling
Bamse och Vulkanön - Del 1
Bamse och Vulkanön - Del 2
Bamse och Vulkanön - Del 3
```
the service will respond with an array of indexes like this: 
```
[0, 3, 7, 8]
```

Thus, the service can be used to easily start playing a section of a Spotify playlist, no matter if multiple sections belong to the same album or not.

## How to get started

### Create Spotify app

* Sign up or log in to [Spotify for Developers](https://developer.spotify.com/)
* Go to [Spotify Dashboard](https://developer.spotify.com/dashboard/applications) and create a new app. 
    * Make note of the **Client ID** and the **Client Secret**. 
    * Click _edit settings_. In *Redirect URIs* add the URL for where the server will be hosted and suffix it with `/callback`, for example: `http://192.168.0.10:12345/callback` (can be local or external URL)

### Download and configure server

* Clone this repository:
    ```
    git clone https://github.com/oscarb/spotify-sectionize.git
    ```
* Copy the `.env.sample` into a `.env` file and change the variablees to match your host, port and Spotify Client ID and Client Secret.

### Start server

#### Docker Compose

Using a terminal in the current directory, simply run:
```
docker-compose up -d 
```

This will build an image when run for the first time and start a container otherwise.

### Authorize

Follow these steps to to connect the server with your Spotify account, in order to read your private playlists.

1. Open a browser and navigate to http://localhost:12345/authorize 
2. Open the authorization link given to you in a new tab
3. Sign into Spotify if required and approve app permissions requested

Voila! 🎉  The server should now be authorized on behalf of your account and ready to sectionize playlists for you! 

### Try it out!

When copying the URL to a Spotify playlist, the playlist ID can be found. Use it to find sections by doing a GET request like this:
```
http://localhost:12345/sectionize?playlist=04z6AX3Pm3aFzO4Xwg2KOg
```

## Note on security

While account information permissions are requested, this server _only_ uses the playlist scope to read track names from private playlists.


