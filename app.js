'use strict';

const express = require('express')
const storage = require('node-persist')
const Spotify = require('spotify-web-api-node')

// Constants
const PORT = 8080
const HOST = '0.0.0.0'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URL = `${process.env.HOST}:${process.env.PORT}/callback`

const scopes = ['playlist-read-private']


// App
const app = express()

// Setup storage
initStorage()

// Spotify API 
const spotifyApi = new Spotify({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URL
});

// Endpoints
app.get('/authorize', (req, res) => {
    var authorizeUrl = spotifyApi.createAuthorizeURL(scopes, 'state_init')
    res.send(`Authorization URL: ${authorizeUrl}`)
});

app.get('/callback', async (req, res) => {
    let code = req.query.code
    console.log("Got code, requesting tokens...")

    try {
        const data = await spotifyApi.authorizationCodeGrant(code)

        console.log('The token expires in ' + data.body['expires_in'])
        console.log('The access token is ' + data.body['access_token'])
        console.log('The refresh token is ' + data.body['refresh_token'])

        // Set the access token on the API object to use it in later calls
        const accessToken = data.body['access_token']
        const refreshToken = data.body['refresh_token']
        spotifyApi.setAccessToken(accessToken)
        spotifyApi.setRefreshToken(refreshToken)
        await storage.setItem('accessToken', accessToken)
        await storage.setItem('refreshToken', refreshToken)

        res.send(`Tokens saved!`);
    } catch(err) {
        console.log('Something went wrong!', err)
    }
});

app.get('/sectionize', async (req, res) => {
    // Sectionize 
    try {
        const playlistId = req.query.playlist;
        const sections = await sectionizePlaylist(playlistId)
        res.json(sections);
    } catch (err) {
        console.log(err)
        res.json([0])
    }
});


app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`)
});


async function initStorage() {
    await storage.init()
    let accessToken = await storage.get('accessToken')
    let refreshToken = await storage.get('refreshToken')

    spotifyApi.setAccessToken(accessToken)
    spotifyApi.setRefreshToken(refreshToken)
}

async function sectionizePlaylist(id = '', retryCount = 0) {
    console.log('/sectionize requested, playlist', id)
    
    try {
        const playlist = await getPlaylistWithTracks(id)
        const trackNames = playlist.tracks.items.map(item => item.track.name)
        const sections = sectionize(trackNames)

        console.log(sections)
        console.log(Object.values(sections))

        return Object.values(sections)

    } catch (err) {
        if (err.statusCode == 401 && retryCount < 5) {
            // Access token likely expired, refresh token
            let data = await spotifyApi.refreshAccessToken()
            console.log("Refreshed token. mew token: " + JSON.stringify(data))
            spotifyApi.setAccessToken(data.body['access_token'])
            await storage.set('accessToken', data.body['access_token'])

            return await sectionizePlaylist(id, ++retryCount)
        } else {
            return err
        }
    }
}

function sectionize(trackNames) {
    const sections = {}; 

    console.log(trackNames)

    for (let i = 0; i < trackNames.length; i++) {
        const name = trackNames[i]
        const sectionName = name.slice(0, name.lastIndexOf(' - '))
        
        if (!(sectionName in sections)) {
            sections[sectionName] = i
        }
    }

    return sections
}

async function getPlaylistWithTracks(id) {
    const playlist = (await spotifyApi.getPlaylist(id)).body

    // If there are more tracks than the limit (100 by default)
    if (playlist.tracks.total > playlist.tracks.limit) {

        // Divide the total number of track by the limit to get the number of API calls
        for (let i = 1; i < Math.ceil(playlist.tracks.total / playlist.tracks.limit); i++) {

            const tracksToAdd = (await spotifyApi.getPlaylistTracks(id, {
                offset: playlist.tracks.limit * i // Offset each call by the limit * the call's index
            })).body;

            // Push the retreived tracks into the array
            tracksToAdd.items.forEach((item) => playlist.tracks.items.push(item));
        }
    }

    return playlist
}