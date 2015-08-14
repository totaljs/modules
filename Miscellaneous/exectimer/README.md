execTimer
---------

execTimer is a total.js module to track code execution time.

Usage
-----

execTimer is loaded automatically by framework core. To instantiate a new timer:

```
var timer = new F.execTimer();
```

This creates a new timer with a random id.

### Methods

#### start()

Starts a new timer's tick. When a tick is created, the results are pushed into an array of ticks to calculate metrics.

#### stop()

Stops the timer's tick

#### diff(parse)

parse (Boolean) - *optional* - human readable result.

Get the raw output of last tick.

#### count()

Get the total number of ticks.

#### avg(parse)

parse (Boolean) - *optional* - human readable result.

Return the average duration of all ticks.

#### min(parse)

parse (Boolean) - *optional* - human readable result.

Return the shortest tick.

#### max(parse)

parse (Boolean) - *optional* - human readable result.

Return the longest tick.

#### duration()

Return the duration of all ticks.

#### parse(number)

Get a human readable number in ns, us, ms, s.

#### getID()

Get the ID of the timer

#### getTicks()

Get all raw ticks



Example
-------

```
// Create a new timer
var timer = new F.execTimer();

// Start a new tick.
timer.start();
for (var i = 0; i < 10000000; i++) { }
timer.stop();

// Start another tick
timer.start();
for (var i = 0; i < 10000000; i++) { }
timer.stop();

//  Results
console.log('COUNT', timer.count()); // Total ticks
console.log('AVG', timer.avg(true)); // parsed average duration
console.log('MIN', timer.min(true)); // parsed min duration
console.log('MAX', timer.max(true)); // parsed max duration 
```