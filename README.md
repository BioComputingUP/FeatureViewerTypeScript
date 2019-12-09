# TypeScript Feature Viewer

This is a code repository for the BioComputingUP Feature Viewer project.
Full documentation at: http://protein.bio.unipd.it/feature-viewer.

This project is based on the Javascript version [calipho-sib/feature-viewer](https://github.com/calipho-sib/feature-viewer), 
Copyright (c) 2015, SIB Swiss Institute of Bioinformatics. This version is <b>Typescript-based</b> 
and compatible with <b>Angular 2+</b>.

Represent biological data with the feature viewer library! Used in [MobiDB](http://mobidb.bio.unipd.it/), 
[DisProt](http://www.disprot.org/), [RepeatsDB](http://repeatsdb.bio.unipd.it/) and 
[PhytotypeDB](http://phytotypedb.bio.unipd.it/).

## Getting started

1 Install the library using npm
```
npm install feature-viewer-typescript
```

2 Import the feature viewer in javascript or your angular component
```typescript
import {FeatureViewer} from 'feature-viewer-typescript/lib';
```

3 Place the feature viewer in your html
```html
<div id="myfv"></div>
```

4 Create an instance of the feature viewer in javascript and style it
```typescript
const proteinsequence = 'MTKFTILLISLLFCIAHTCSASKWQHQQDSCRKQLQGVNLTPCEKHIMEKIQGRGDDDDDDDDDNHILRTMRGRINYIRRNEGKDEDEE'
const fv = new FeatureViewer(proteinsequence, '#myfv', {
               showAxis: true,
               showSequence: true,
               toolbar: true,
               toolbarPosition: 'left',
               zoomMax: 10,
               flagColor: '#DFD5F5'
           });
```

5 Add features and subfeatures
```typescript
fv.addFeatures(
      [
        { // simple rect
          type: 'rect',
          id: 'useUniqueId',
          data: [ {
            x: 50, y: 78,
            tooltip: '<button class="myButton">Button</button>'} ],
        },
        { // circles
          type: 'circle',
          id: 'mycircle',
          label: 'Circle feature',
          data: [{x: 10 , y: 100}, {x: 50, y: 70}, {x: 40, y: 60, color: '#00ac8f', tooltip: 'I have different color'}],
          color: '#61795e'
        },
        { // curve (height and yLim) with tooltip and subfeatures
          type: 'curve',
          id: 'mycurve',
          label: 'Curve label',
          data: [{x: 1, y: 0}, {x: 40, y: 102}, {x: 80, y: 5}, {x: 50, y: 184}, {x: 75, y: 4}],
          height: 1,
          yLim: 200,
          color: '#00babd',
          tooltip: '<b>Very</b> <span style="color: #C21F39">Stylable</span> <b><i><span style="color: #ffc520">Tooltip </span></i></b>',
          subfeatures: [
            {
              type: 'rect',
              data: [
                {x: 20, y: 30},
                {x: 15, y: 45},
                {x: 70, y: 76, label: 'myRect', tooltip: 'myTooltip'}
              ],
              id: 'aDifferentId',
              label: 'I am a subfeature!'
            }
          ]
        }
      ]
    )
```

![Feature Viewer](assets/fvDemo.png)

## Support

If you have any problem or suggestion please open an issue.

## License

This repo is based on [calipho-sib/feature-viewer](https://github.com/calipho-sib/feature-viewer), Copyright (c) 2015, SIB Swiss 
Institute of Bioinformatics.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public 
License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later 
version.
