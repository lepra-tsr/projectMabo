@extends('page')

@section('stylesheet')

@endsection

@section('title','Welcome to Mabo!')

@section('content')

    <div class="container-fluid">
        <div class="mt-5 offset-md-3 col-md-6">
            <div class="card">
                <div class="card-block">
                    <h1 class="card-title">Project Mabo</h1>
                    <h6 class="card-subtitle text-muted">TRPG online session utility.</h6>
                    <form>
                        <div class="form-group mt-3">
                            <label class="sr-only" for="mabo-pw">Password</label>
                            <div class="input-group">
                                <div class="input-group-addon">
                                    <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                                    </svg>
                                </div>
                                <input type="text" class="form-control form-control-sm" id="mabo-pw" placeholder="">
                            </div>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary btn-outline-primary" type="button"
                                    onclick="location.href = '{{ url('mabo/scenarios') }}'">
                                login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')

@endsection