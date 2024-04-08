<?php

//$password = 'lz7345n';
session_start();

if (isset( $_GET['logout'] ) )  {
    session_destroy();
    header('Location: /');
}


function flash(?string $message = null)
{
    if ($message) {
        $_SESSION['flash'] = $message;
    } else {
        if ($_SESSION['flash']) { ?>
            <div class="alert alert-danger mb-3">
                <?=$_SESSION['flash']?>
            </div>
        <?php }
        unset($_SESSION['flash']);
    }
}

function isLogged(): bool
{
    global $dd;

    if ( $_SESSION['login'] === true ) return true;

    if ( isset( $_POST['username'] ) && isset( $_POST['password'] ) ) {
        $res = [
            'Username'=>'lmz',
            'Password'=>'lz7345n',
            'ID' => 1
        ];

        //$dd->one('SELECT `ID`, `Username`, `Password` FROM `users` WHERE `Email`=?s', $_POST['login']);
//        echo var_dump( $_POST );
        if(isset($res['Password']) && $res['Password']===$_POST['password'] && $res['Username']===$_POST['username']){
            $_SESSION['login']=true;
            $_SESSION['user_id']=$res['ID'];
            return true;
        }
        flash('Логин/пароль неверны');
    }

    return false;
}

function loginShow(  ){ ?>
<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Login</title>
        <link rel='stylesheet' href='/css/styles.css'>
        <style>
            .login-cont{
                width: 100vw;
                height: 100vh;
            }
            .profile-img-card{
                width: 100px;
            }
            .inner-cont{
                padding: 32px 16px 16px;
                border: #ccc 4px solid;
            }
        </style>
    </head>
    <body>
    <div class="login-cont cont df a5">
        <div class="inner-cont dfcc a2 gap">
            <p id="profile-name-field" class="profile-name-card"><span id="login__error">
                <?php flash(); ?>
            </span></p>
            <form class="form-signin dfc gap" action="/" method="post">
                <span id="reauth-email" class="reauth-email"></span>
                <input name="username" id="username" class="form-control" placeholder="Имя" required autofocus>
                <input name="password" type="password" id="inputPassword" class="form-control" placeholder="Пароль" required>
                <div id="remember" class="checkbox">
                    <label>
                        <input type="checkbox" value="remember-me"> Запомнить
                    </label>
                </div>
                <input type="hidden" name="enter" value="0">
                <input type="hidden" name="enter" value="1">
                <button class="btn btn-lg btn-primary btn-block btn-signin" type="submit">Войти</button>
            </form>
        </div>
    </div>

    </body>
    </html>
<?php }

function checkLogin(){
    if ( !isLogged() ) {
        loginShow();
        die();
    }
}









/*    <script>
        function getLocalProfile(callback){
            var profileName        = localStorage.getItem("PROFILE_NAME");
            var profileReAuthEmail = localStorage.getItem("PROFILE_REAUTH_EMAIL");
            if(profileName !== null && profileReAuthEmail !== null ) callback( profileName, profileReAuthEmail);
        }

        function loadProfile() {
            if(!supportsHTML5Storage()) { return false; }
            getLocalProfile(function( profileName, profileReAuthEmail) {
                let tt = q=> document.querySelector(q);
                tt("#profile-name").textContent = (profileName);
                tt("#reauth-email").textContent = (profileReAuthEmail);
                tt("#inputEmail").style.display='none';
                tt("#remember").style.display='none';
            });
        }
        function supportsHTML5Storage() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }
        //loadProfile();

        function setLocalStorageData( data ) {
            if(!supportsHTML5Storage()) { return false; }
            localStorage.setItem("PROFILE_NAME", " ");
            localStorage.setItem("PROFILE_REAUTH_EMAIL", " ");
            localStorage.setItem("PROFILE_PASS", " ");
        }
    </script>*/
