import { app, BrowserWindow, Menu, session } from "electron";
import path from "path";
import http from "http";
import { spawn, ChildProcess } from "child_process";


let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;


const PORT = 8081;
const SERVER_URL = `http://localhost:${PORT}`;



function checkServerReady(): Promise<boolean> {

    return new Promise((resolve) => {

        http.get(SERVER_URL, (res) => {

            resolve((res.statusCode ?? 500) < 500);

        }).on("error", () => {

            resolve(false);

        });

    });

}



async function waitForServer(maxAttempts = 60) {


    for (let i = 0; i < maxAttempts; i++) {


        if (await checkServerReady()) {

            return true;

        }


        await new Promise(r => setTimeout(r,1000));

    }


    return false;

}





function startBackendServer(){


    let backendPath;


    if(app.isPackaged){


        // داخل نسخة العميل

        backendPath = path.join(
            process.resourcesPath,
            "backend"
        );


    }else{


        // أثناء التطوير

        backendPath = path.join(
            __dirname,
            "../../backend"
        );


    }



    serverProcess = spawn(


        process.platform === "win32"
        ? "backend.exe"
        : "./backend",


        [],


        {

            cwd: backendPath,

            detached:false,

            windowsHide:true,

            stdio:"ignore"

        }


    );



    serverProcess.on(
        "error",
        err=>{
            console.log(
                "Backend Error:",
                err
            );
        }
    );

}




function createSplashWindow(){


    splashWindow = new BrowserWindow({


        width:500,

        height:500,

        frame:false,

        transparent:true,

        alwaysOnTop:true,

        resizable:false,


        icon:path.join(
            __dirname,
            "../assets/icon.ico"
        ),



        webPreferences:{

            nodeIntegration:false,

            contextIsolation:true

        }


    });



    if(app.isPackaged){


        splashWindow.loadFile(
            path.join(
                __dirname,
                "../renderer/splash.html"
            )
        );


    }else{


        splashWindow.loadURL(
            `${SERVER_URL}/splash`
        );

    }


}






async function createMainWindow(){



    mainWindow = new BrowserWindow({


        width:1500,

        height:900,


        show:false,


        icon:path.join(
            __dirname,
            "../assets/icon.ico"
        ),


        title:"Omni System Pro",



        autoHideMenuBar:true,



        webPreferences:{


            nodeIntegration:false,

            contextIsolation:true,


            webSecurity:true


        }


    });





    Menu.setApplicationMenu(null);



    session.defaultSession
    .setPermissionRequestHandler(
        (webContents,permission,callback)=>{

            callback(true);

        }
    );





    await waitForServer();




    if(app.isPackaged){


        await mainWindow.loadURL(
            `${SERVER_URL}/pos`
        );


    }else{


        await mainWindow.loadURL(
            "http://localhost:5173/pos"
        );


    }





    mainWindow.maximize();





    mainWindow.once(
        "ready-to-show",
        ()=>{


            splashWindow?.close();

            splashWindow=null;


            mainWindow?.show();


        }
    );





    mainWindow.on(
        "closed",
        ()=>{

            mainWindow=null;

        }
    );


}







app.whenReady()
.then(async()=>{


    Menu.setApplicationMenu(null);



    createSplashWindow();



    startBackendServer();



    await createMainWindow();



});








app.on(
"window-all-closed",
()=>{


    if(serverProcess){


        try{


            serverProcess.kill();


        }catch{}


    }



    if(process.platform!=="darwin"){


        app.quit();


    }


});







app.on(
"before-quit",
()=>{


    if(serverProcess){


        serverProcess.kill();


    }


});





app.on(
"activate",
()=>{


    if(BrowserWindow.getAllWindows().length===0){


        createMainWindow();


    }


});