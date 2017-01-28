<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/


Route::get('/', function () {
    return view('welcome');
});


// ログイン画面
Route::get('mabo', function () {
    return view('pages.welcome');
});

// シナリオ一覧画面
Route::match(['get','post'],'mabo/scenarios', function () {
    return view('pages.scenarios');
});

// シナリオプレイ画面
Route::match(['get','post'],'mabo/scenarios/{scenarioId}', function () {
    
    return view('pages.playground');
});