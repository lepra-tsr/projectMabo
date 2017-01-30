/**
 * Created by lepra_tashiro on 2017/01/29.
 */

/**
 * 左から0埋めを行う
 * @param input 対象の数値
 * @param length 埋めた後の桁数
 * @returns {*}
 */
function zero_padding_left(input, length) {

    var inputLength = input.toString().length;

    // inputの文字数が、揃えたい桁数と同じかそれ以上なら何もしない
    if (inputLength >= length) {
        return input;
    }

    var prefix = '';

    for (var i = 0; i < length; i++) {
        prefix += '0';
    }
    console.info(input); // @DELETEME
    console.info(length); // @DELETEME
    console.info(prefix + input.toString()); // @DELETEME

    var output = (prefix + input.toString()).slice(-1 * length);
    console.info(output); // @DELETEME
    return;
}