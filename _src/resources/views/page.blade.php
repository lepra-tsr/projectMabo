<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">

        {{-- Bootstrap core CSS--}}
        <link rel="stylesheet" href="{{ asset('/css/bootstrap/bootstrap.css') }}" type="text/css">

        {{-- Octicons core CSS--}}
        <link rel="stylesheet" href="{{ asset('/octicons/octicons.min.css') }}" type="text/css">

        @section('stylesheet')

        @show

        {{-- favicon --}}
        {{--<link rel="apple-touch-icon" href="/apple-touch-icon.png">--}}
        {{--<link rel="icon" href="/favicon.ico">--}}

        <title>
            @yield('title')
        </title>

    </head>
    <body>
        @section('content')
            page
        @show

        {{-- jQuery core js --}}
        {{-- @TODO --}}

        {{-- tether core js --}}
        {{-- @TODO --}}

        {{-- Bootstrap core js --}}
        {{-- @TODO --}}

        @section('script')
            script
        @show
    </body>
</html>
