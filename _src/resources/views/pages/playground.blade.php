@extends('page')

@section('stylesheet')

@endsection

@section('title','Welcome to Mabo!')

@section('content')
    <div class="container-fluid">
        <div class="mt-3">
            <div class="card-columns">
                <div class="card">
                    <div class="card-block">
                        <h3 class="card-title">GHOST MACHINE</h3>
                        <h6 class="card-subtitle">No.001
                            {{-- key icon --}}
                            <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                            </svg>
                            {{-- eye icon --}}
                            <svg class="octicon octicon-eye" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                            </svg>
                        </h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <p class="mt-2 card-text small text-muted">
                                    解禁: 2017/01/09(月) 以降<br/>
                                    形式: テキセ、ボイセ<br/>
                                    人数: 1~8名<br/>
                                    KP: tsrm<br/>
                                    舞台: 拝栄州市 市街<br/>
                                    必須技能: なし<br/>
                                    ステータス下限制限: なし<br/>
                                    殺意: 普通<br/>
                                    メイン: 探索、交渉、心霊現象<br/>
                                </p>
                            </li>
                            <li class="list-group-item">
                                <span class="badge badge-warning">&nbsp;KP&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL1&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL2&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL3&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL4&nbsp;</span>&nbsp;
                            </li>
                            <li class="list-group-item pt-4">

                                <footer>

                                    <button class="btn btn-sm btn-primary btn-outline-primary" type="button" onclick="">Join</button>
                                    <small>Last used 3 days ago.</small>
                                </footer>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card">
                    <div class="card-block">
                        <h3 class="card-title">GHOST MACHINE</h3>
                        <h6 class="card-subtitle">No.001
                            {{-- key icon --}}
                            <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                            </svg>
                            {{-- eye icon --}}
                            <svg class="octicon octicon-eye" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                            </svg>
                        </h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <p class="mt-2 card-text small text-muted">
                                    解禁: 2017/01/09(月) 以降<br/>
                                    形式: テキセ、ボイセ<br/>
                                    人数: 1~8名<br/>
                                    KP: tsrm<br/>
                                    舞台: 拝栄州市 市街<br/>
                                    必須技能: なし<br/>
                                    ステータス下限制限: なし<br/>
                                    殺意: 普通<br/>
                                    メイン: 探索、交渉、心霊現象<br/>
                                </p>
                            </li>
                            <li class="list-group-item">
                                <span class="badge badge-warning">&nbsp;KP&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL1&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL2&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL3&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL4&nbsp;</span>&nbsp;
                            </li>
                            <li class="list-group-item pt-4">

                                <footer>

                                    <button class="btn btn-sm btn-primary btn-outline-primary" type="button" onclick="">Join</button>
                                    <small>Last used 3 days ago.</small>
                                </footer>
                            </li>
                        </ul>
                    </div>
                </div>
                {{-- シナリオ作成カード --}}
                <div class="card card-primary card-outline-primary">
                    <div class="card-block">
                        <h3 class="card-title">Create Scenario</h3>
                        <h6 class="ml-3 card-subtitle text-muted">
                            <small>素晴らしい！なんというシナリオですか？</small>
                        </h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <div class="mt-3 form-group form-group-sm">

                                    <label>
                                        <input class="form-control form-control-sm" type="text" placeholder="Scenario Title">
                                    <small class="text-muted"></small>
                                    </label>
                                    <div class="has-warning">
                                        <label class="form-check-label">
                                            <input type="checkbox" class="form-check-input">
                                            {{-- eye icon --}}
                                            <svg class="octicon octicon-eye" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                                                <path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                                            </svg>
                                            <small>閲覧禁止(無用な心配では？)</small>
                                        </label>
                                    </div>

                                    <div class="has-danger">
                                        <label class="form-check-label">
                                            <input type="checkbox" class="form-check-input">
                                            {{-- key icon --}}
                                            <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                                <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                                            </svg>
                                            <small>鍵付き(恐らく面倒なだけ！)</small>
                                        </label>
                                    </div>
                                </div>
                            </li>
                            <li class="list-group-item pt-4">

                                <footer>

                                    <button class="btn btn-sm btn-primary btn-outline-primary" type="button" onclick="">
                                        Create
                                    </button>
                                    <small class="text-muted">...</small>
                                </footer>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card">
                    <div class="card-block">
                        <h3 class="card-title">GHOST MACHINE</h3>
                        <h6 class="card-subtitle">No.001
                            {{-- key icon --}}
                            <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                            </svg>
                            {{-- eye icon --}}
                            <svg class="octicon octicon-eye" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                            </svg>
                        </h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <p class="mt-2 card-text small text-muted">
                                    解禁: 2017/01/09(月) 以降<br/>
                                    形式: テキセ、ボイセ<br/>
                                    人数: 1~8名<br/>
                                    KP: tsrm<br/>
                                    舞台: 拝栄州市 市街<br/>
                                    必須技能: なし<br/>
                                    ステータス下限制限: なし<br/>
                                    殺意: 普通<br/>
                                    メイン: 探索、交渉、心霊現象<br/>
                                </p>
                            </li>
                            <li class="list-group-item">
                                <span class="badge badge-warning">&nbsp;KP&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL1&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL2&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL3&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL4&nbsp;</span>&nbsp;
                            </li>
                            <li class="list-group-item pt-4">

                                <footer>

                                    <button class="btn btn-sm btn-primary btn-outline-primary" type="button" onclick="">Join</button>
                                    <small>Last used 3 days ago.</small>
                                </footer>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card">
                    <div class="card-block">
                        <h3 class="card-title">GHOST MACHINE</h3>
                        <h6 class="card-subtitle">No.001
                            {{-- key icon --}}
                            <svg class="octicon octicon-key" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.83 2.17C12.08 1.42 11.14 1.03 10 1c-1.13.03-2.08.42-2.83 1.17S6.04 3.86 6.01 5c0 .3.03.59.09.89L0 12v1l1 1h2l1-1v-1h1v-1h1v-1h2l1.09-1.11c.3.08.59.11.91.11 1.14-.03 2.08-.42 2.83-1.17S13.97 6.14 14 5c-.03-1.14-.42-2.08-1.17-2.83zM11 5.38c-.77 0-1.38-.61-1.38-1.38 0-.77.61-1.38 1.38-1.38.77 0 1.38.61 1.38 1.38 0 .77-.61 1.38-1.38 1.38z"></path>
                            </svg>
                            {{-- eye icon --}}
                            <svg class="octicon octicon-eye" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path>
                            </svg>
                        </h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <p class="mt-2 card-text small text-muted">
                                    解禁: 2017/01/09(月) 以降<br/>
                                    形式: テキセ、ボイセ<br/>
                                    人数: 1~8名<br/>
                                    KP: tsrm<br/>
                                    舞台: 拝栄州市 市街<br/>
                                    必須技能: なし<br/>
                                    ステータス下限制限: なし<br/>
                                    殺意: 普通<br/>
                                    メイン: 探索、交渉、心霊現象<br/>
                                </p>
                            </li>
                            <li class="list-group-item">
                                <span class="badge badge-warning">&nbsp;KP&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL1&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL2&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL3&nbsp;</span>&nbsp;
                                <span class="badge badge-default">&nbsp;PL4&nbsp;</span>&nbsp;
                            </li>
                            <li class="list-group-item pt-4">

                                <footer>

                                    <button class="btn btn-sm btn-primary btn-outline-primary" type="button" onclick="">Join</button>
                                    <small>Last used 3 days ago.</small>
                                </footer>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')

@endsection