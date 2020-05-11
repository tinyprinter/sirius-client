# `sirius-client`

Have you ever wished you had a Little Printer? But you were a fool (like me!) that didn't buy one when they were available? But wish you could still join in on the fun?

Well, with a generic thermal printer and this library, we can get you some of the way there.

## Running `sirius-client`

⚠️ First of all: don't, yet.

This library is mostly a stream-of-consciousness idea, with way too many hard-coded components. Gotta do something about that.

But, the good news, it works.

Currently there are drivers for generic escpos (Epson + most cheap thermal printers), Star, and Paperang printers. Only over USB for now, which is a bit limiting, but it's okay.

## What needs doing?

Oof, a lot, to make it useful.

## Okay, but how can I try?

Okay, first set up an account over at the [server](https://littleprinter.nordprojects.co/), and you'll want to "Claim a printer".

There's a command to generate it if you want to pull down the sirius server code, or we can create a file manually. Let's do the latter:

Create a `fixtures/my-printer.printer` file, and enter something like the following:

```
     address: 12340f6aaeb07dad
       DB id: 1
      secret: 1275898b6e
         xor: 12311906
  claim code: abcd-efgh-abcd-efgh
```

Then we run a command:

```
yarn ts-node bin/client.ts run --uri wss://littleprinter.nordprojects.co/api/v1/connection -p ./my-printer.printer
```

You should get a connection to the server. Great. The server can recognise our claim code! Enter the claim code on the server, then you should be ready to start firing print commands to it.

By default it'll just use the console printer, so images will appear (upside down!) in the console as long as you're connected. 💸

## What's missing?

Clearly, not much of an onboarding experience exists. Ideally, on first run you'd just run the command, it would:

- detect a printer (if USB, at least)
- generate the claim code + save settings
- print out claim code
- reuse the settings automatically next run

Future ideas include:

- multiplex printing (print to multiple printers in parallel)
- Bluetooth printer support
- web-based printer configuration via admin control panel

## How can I help?

Right now, you probably can't very much. I'll tidy this up, add some tests, and then it's in a better shape for collaborating.
