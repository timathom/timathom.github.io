/* eslint no-shadow: 0 */
'use strict';

var test = require('tap').test;
var ss = require('../');

function rnd(x) {
    return Math.round(x * 1000) / 1000;
}

test('sample variance', function(t) {
    t.test('can get the sample variance of a six-sided die', function(t) {
        t.equal(rnd(ss.sampleVariance([1, 2, 3, 4, 5, 6])), 3.5);
        t.end();
    });

    // confirmed in R
    //
    // > var(1:10)
    // [1] 9.166667
    t.test('can get the sample variance of numbers 1-10', function(t) {
        t.equal(rnd(ss.sampleVariance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])), 9.167);
        t.end();
    });

    t.test('the sample variance of two numbers that are the same is 0', function(t) {
        t.equal(rnd(ss.sampleVariance([1, 1])), 0);
        t.end();
    });

    t.test('the sample variance of one number is null', function(t) {
        t.ok(isNaN(ss.sampleVariance([1])));
        t.end();
    });

    t.test('the sample variance of no numbers is null', function(t) {
        t.ok(isNaN(ss.sampleVariance([])));
        t.end();
    });
    t.end();
});
