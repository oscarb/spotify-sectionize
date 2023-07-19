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