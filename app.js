const {app,BrowserWindow, Menu} = require('electron');
const url = require('url');
const path = require('path')
const fs = require('fs')
const discordRpc = require('discord-rpc');
let win;


function createWindow(){
    win = new BrowserWindow({
        darkTheme:true,
        titleBarStyle:"hidden",
        title:"Apple Music",
        backgroundColor:"#1e1e1e",
        icon:"./icon.png"
    })
    win.setMenuBarVisibility(false)
    win.setTitle("Apple Music");
    win.loadURL("https://music.apple.com/us/browse");
}

app.on('widevine-ready',createWindow)

app.on('window-all-closed',function(){
    app.quit();
})
function getTime(list){
    let ret = 0;
    for (let index = list.length - 1; index >= 0; index--) {
      ret += parseInt(list[index]) * 60 ** index;
    }
    return ret
}


function getTimestamps(audioDuration){
    const splitAudioDuration = audioDuration.split(":").reverse();
  
    const parsedAudioDuration = getTime(splitAudioDuration);
  
    const startTime = Date.now();
    const endTime = Math.floor(startTime / 1000) + parsedAudioDuration;
    return [Math.floor(startTime / 1000), endTime];
  }
  
//
const clientId = "825614106085031976";

const rpc = new discordRpc.Client({transport:'ipc'})

let songName;
let status;
let timeStamp;
let time;
let songAuthor
async function setActivity(){
    if(!rpc|!win){
        return;
    }
    try{
         time = await win.webContents.executeJavaScript('document.querySelector(".web-chrome-playback-lcd__time-end").textContent');
         timeStamp = getTimestamps(time)
         songName = await win.webContents.executeJavaScript("document.querySelector('#playback-name > div > div > span:nth-child(1) > span').textContent.trim()")
         songAuthor = await win.webContents.executeJavaScript("(document.querySelector('.web-chrome-playback-lcd__sub-copy-scroll-inner-text-wrapper').textContent.replace(/\s(?=\s)/g,'')).trim()");
         status = songName
         rpc.setActivity({
            details: status,
            state:songAuthor ? songAuthor:"Unknown",
            startTimestamp:timeStamp[0],
            endTimestamp:timeStamp[1],
            largeImageKey:"logomain"
        })
    }catch(e){
        console.log(e)
        status = "Searching..."
        rpc.setActivity({
            details: status,
            largeImageKey:"logomain",
        }) 
    }
    
    
    
    
}

rpc.on('ready', ()=>{
    setActivity();

    setInterval(() => {
        setActivity();
    },15e3 );
})

rpc.login({clientId}).catch(console.error);