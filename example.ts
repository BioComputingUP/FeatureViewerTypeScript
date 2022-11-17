// Import feature viewer
import {FeatureViewer} from "./src/feature-viewer";

// Import styles
import './example.scss';

// TODO Wait for page to load
window.onload = () => {
    // Define sequence
    let sequence = "MDPGQQPPPQPAPQGQGQPPSQPPQGQGPPSGPGQPAPAATQAAPQAPPAGHQIVHVRGDSETDLEALFNAVMNPKTANVPQTVPMRLRKLPDSF" +
                   "FKPPEPKSHSRQASTDAGTAGALTPQHVRAHSSPASLQLGAVSPGTLTPTGVVSGPAATPTAQHLRQSSFEIPDDVPLPAGWEMAKTSSGQRYFL" +
                   "NHIDQTTTWQDPRKAMLSQMNVTAPTSPPVQQNMMNSASGPLPDGWEQAMTQDGEIYYINHKNKTTSWLDPRLDPRFAMNQRISQSAPVKQPPPL" +
                   "APQSPQGGVMGGSNSNQQQQMRLQQLQMEKERLRLKQQELLRQAMRNINPSTANSPKCQELALRSQLPTLEQDGGTQNPVSSPGMSQELRTMTTN" +
                   "SSDPFLNSGTYHSRDESTDSGLSMSSYSVPRTPDDFLNSVDEMDTGDTINQSTLPSQQNRFPDYLEAIPGTNVDLGTLEGDGMNIEGEELMPSLQ" +
                   "EALSSDILNDMESVLAATKLDKESFLTWL";
    // Instantiate feature viewer
    let featureViewer = new FeatureViewer(sequence, '#feature-viewer',
    // Define optional settings
    {
        toolbar: true,
        toolbarPosition: 'left',
        brushActive: true,
        zoomMax: 10,
        flagColor: 'white',
        flagTrack: 170,
        flagTrackMobile: 150
    },
    // Define optional features
    [
        {
            type: 'curve',
            id: 'Curve1',
            label: 'Random values',
            color: 'red',
            data: Array.from(new Array(sequence.length), (x, i) => ({x: i + 1, y: Math.random()})),
            subfeatures: [
                {
                    type: 'curve',
                    id: 'Curve2',
                    label: 'Random values',
                    color: 'blue',
                    height: 1,
                    data: Array.from(new Array(sequence.length), (x, i) => ({x: i + 1, y: Math.random() /2 }))
                }
            ]
        },
        {
            type: 'rect',
            id: 'Degrons',
            label: 'Degrons',
            color:'grey',
            data: [{"x": 186, "y": 194, "color": "#006dc4", "tooltip": "186-194 xRxxLxx[LIVM]x", "stroke": "black"}, {"x": 348, "y": 356, "color": "#006dc4", "tooltip": "348-356 xRxxLxx[LIVM]x", "stroke": "black"}, {"x": 1, "y": 2, "color": "#c90076", "tooltip": "1-2 Mx", "stroke": "black"}, {"x": 1, "y": 3, "color": "#c90076", "tooltip": "1-3 M{0,1}([ED])x", "stroke": "black"}, {"x": 399, "y": 405, "color": "#006dc4", "tooltip": "399-405 D(S)Gx{2,3}([ST])", "stroke": "black"}, {"x": 180, "y": 184, "color": "#006dc4", "tooltip": "180-184 [AVP]x[ST][ST][ST]", "stroke": "black"}, {"x": 399, "y": 403, "color": "#006dc4", "tooltip": "399-403 DSGLS", "stroke": "black"}],
        },
        {
            type: 'rect',
            id: 'IDRs',
            label: 'IDRs',
            data: [{"x": 1, "y": 58, "color": "#9e7398", "stroke": "black"}, {"x": 60, "y": 61, "color": "#9e7398", "stroke": "black"}, {"x": 75, "y": 82, "color": "#9e7398", "stroke": "black"}, {"x": 101, "y": 170, "color": "#9e7398", "stroke": "black"}, {"x": 206, "y": 230, "color": "#9e7398", "stroke": "black"}, {"x": 264, "y": 300, "color": "#9e7398", "stroke": "black"}, {"x": 330, "y": 504, "color": "#9e7398", "stroke": "black"}],
            color:'grey'
        },
        {
            type: 'rect',
            id: 'Coils',
            label: 'Coils',
            data: [{"x": 1, "y": 49, "color": "#e3b9e5", "stroke": "black"}, {"x": 52, "y": 58, "color": "#e3b9e5", "stroke": "black"}, {"x": 74, "y": 74, "color": "#e3b9e5", "stroke": "black"}, {"x": 78, "y": 85, "color": "#e3b9e5", "stroke": "black"}, {"x": 91, "y": 92, "color": "#e3b9e5", "stroke": "black"}, {"x": 98, "y": 108, "color": "#e3b9e5", "stroke": "black"}, {"x": 110, "y": 168, "color": "#e3b9e5", "stroke": "black"}, {"x": 172, "y": 174, "color": "#e3b9e5", "stroke": "black"}, {"x": 182, "y": 182, "color": "#e3b9e5", "stroke": "black"}, {"x": 185, "y": 186, "color": "#e3b9e5", "stroke": "black"}, {"x": 201, "y": 201, "color": "#e3b9e5", "stroke": "black"}, {"x": 212, "y": 213, "color": "#e3b9e5", "stroke": "black"}, {"x": 215, "y": 220, "color": "#e3b9e5", "stroke": "black"}, {"x": 223, "y": 224, "color": "#e3b9e5", "stroke": "black"}, {"x": 226, "y": 228, "color": "#e3b9e5", "stroke": "black"}, {"x": 231, "y": 233, "color": "#e3b9e5", "stroke": "black"}, {"x": 241, "y": 241, "color": "#e3b9e5", "stroke": "black"}, {"x": 245, "y": 245, "color": "#e3b9e5", "stroke": "black"}, {"x": 260, "y": 260, "color": "#e3b9e5", "stroke": "black"}, {"x": 276, "y": 297, "color": "#e3b9e5", "stroke": "black"}, {"x": 334, "y": 334, "color": "#e3b9e5", "stroke": "black"}, {"x": 340, "y": 340, "color": "#e3b9e5", "stroke": "black"}, {"x": 353, "y": 383, "color": "#e3b9e5", "stroke": "black"}, {"x": 386, "y": 415, "color": "#e3b9e5", "stroke": "black"}, {"x": 417, "y": 418, "color": "#e3b9e5", "stroke": "black"}, {"x": 420, "y": 443, "color": "#e3b9e5", "stroke": "black"}, {"x": 447, "y": 474, "color": "#e3b9e5", "stroke": "black"}, {"x": 494, "y": 494, "color": "#e3b9e5", "stroke": "black"}, {"x": 496, "y": 496, "color": "#e3b9e5", "stroke": "black"}, {"x": 503, "y": 504, "color": "#e3b9e5", "stroke": "black"}],
            color:'grey'
        },
        {
            type: 'rect',
            id: 'Buried',
            label: 'Buried residues',
            data: [{"x": 166, "y": 166, "color": "#D3D3D3", "stroke": "black"}, {"x": 179, "y": 179, "color": "#D3D3D3", "stroke": "black"}, {"x": 188, "y": 188, "color": "#D3D3D3", "stroke": "black"}, {"x": 190, "y": 190, "color": "#D3D3D3", "stroke": "black"}, {"x": 200, "y": 202, "color": "#D3D3D3", "stroke": "black"}, {"x": 232, "y": 232, "color": "#D3D3D3", "stroke": "black"}, {"x": 235, "y": 236, "color": "#D3D3D3", "stroke": "black"}, {"x": 238, "y": 238, "color": "#D3D3D3", "stroke": "black"}, {"x": 247, "y": 249, "color": "#D3D3D3", "stroke": "black"}, {"x": 259, "y": 261, "color": "#D3D3D3", "stroke": "black"}],
            color:'grey'
        },
        {
            type: 'lollipop',
            id: 'Ubiquitination',
            label: 'Ubiquitination',
            color:'grey',
            data: [{"x": 497, "y": 497, "color": "#ffe800", "tooltip": "497K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 181, "y": 181, "color": "#ffe800", "tooltip": "181K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 102, "y": 102, "color": "#ffe800", "tooltip": "102K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 97, "y": 97, "color": "#ffe800", "tooltip": "97K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 90, "y": 90, "color": "#ffe800", "tooltip": "90K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 280, "y": 280, "color": "#ffe800", "tooltip": "280K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 315, "y": 315, "color": "#ffe800", "tooltip": "315K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 321, "y": 321, "color": "#ffe800", "tooltip": "321K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 342, "y": 342, "color": "#ffe800", "tooltip": "342K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 254, "y": 254, "color": "#ffe800", "tooltip": "254K Ubiquitination</br>(PhosphoSitePlus)", "stroke": "black"}],
        },
        {
            type: 'lollipop',
            id: 'Phosphorylation',
            label: 'Phosphorylation',
            color:'grey',
            data: [{"x": 473, "y": 473, "color": "#ffba01", "tooltip": "473S Phosphorylation</br>(iPTMNet)", "stroke": "black"}, {"x": 405, "y": 405, "color": "#ffba01", "tooltip": "405S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 407, "y": 407, "color": "#ffba01", "tooltip": "407Y Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 109, "y": 109, "color": "#ffba01", "tooltip": "109S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 419, "y": 419, "color": "#ffba01", "tooltip": "419S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 436, "y": 436, "color": "#ffba01", "tooltip": "436S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 499, "y": 499, "color": "#ffba01", "tooltip": "499S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 412, "y": 412, "color": "#ffba01", "tooltip": "412T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 403, "y": 403, "color": "#ffba01", "tooltip": "403S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 366, "y": 366, "color": "#ffba01", "tooltip": "366S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 398, "y": 398, "color": "#ffba01", "tooltip": "398T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 164, "y": 164, "color": "#ffba01", "tooltip": "164S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 188, "y": 188, "color": "#ffba01", "tooltip": "188Y Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 217, "y": 217, "color": "#ffba01", "tooltip": "217S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 227, "y": 227, "color": "#ffba01", "tooltip": "227S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 105, "y": 105, "color": "#ffba01", "tooltip": "105S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 274, "y": 274, "color": "#ffba01", "tooltip": "274S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 103, "y": 103, "color": "#ffba01", "tooltip": "103S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 163, "y": 163, "color": "#ffba01", "tooltip": "163S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 276, "y": 276, "color": "#ffba01", "tooltip": "276S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 300, "y": 300, "color": "#ffba01", "tooltip": "300S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 340, "y": 340, "color": "#ffba01", "tooltip": "340S Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 400, "y": 400, "color": "#ffba01", "tooltip": "400S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 94, "y": 94, "color": "#ffba01", "tooltip": "94S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 83, "y": 83, "color": "#ffba01", "tooltip": "83T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 354, "y": 354, "color": "#ffba01", "tooltip": "354T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 361, "y": 361, "color": "#ffba01", "tooltip": "361T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 77, "y": 77, "color": "#ffba01", "tooltip": "77T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 289, "y": 289, "color": "#ffba01", "tooltip": "289S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 63, "y": 63, "color": "#ffba01", "tooltip": "63T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 156, "y": 156, "color": "#ffba01", "tooltip": "156T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 110, "y": 110, "color": "#ffba01", "tooltip": "110T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 131, "y": 131, "color": "#ffba01", "tooltip": "131S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 141, "y": 141, "color": "#ffba01", "tooltip": "141T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 143, "y": 143, "color": "#ffba01", "tooltip": "143T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 128, "y": 128, "color": "#ffba01", "tooltip": "128S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 127, "y": 127, "color": "#ffba01", "tooltip": "127S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 119, "y": 119, "color": "#ffba01", "tooltip": "119T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 114, "y": 114, "color": "#ffba01", "tooltip": "114T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 149, "y": 149, "color": "#ffba01", "tooltip": "149S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 154, "y": 154, "color": "#ffba01", "tooltip": "154T Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 145, "y": 145, "color": "#ffba01", "tooltip": "145T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 138, "y": 138, "color": "#ffba01", "tooltip": "138S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 41, "y": 41, "color": "#ffba01", "tooltip": "41T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 367, "y": 367, "color": "#ffba01", "tooltip": "367S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 381, "y": 381, "color": "#ffba01", "tooltip": "381S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 382, "y": 382, "color": "#ffba01", "tooltip": "382S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 371, "y": 371, "color": "#ffba01", "tooltip": "371S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 61, "y": 61, "color": "#ffba01", "tooltip": "61S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 390, "y": 390, "color": "#ffba01", "tooltip": "390T Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 391, "y": 391, "color": "#ffba01", "tooltip": "391Y Phosphorylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 397, "y": 397, "color": "#ffba01", "tooltip": "397S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}, {"x": 388, "y": 388, "color": "#ffba01", "tooltip": "388S Phosphorylation</br>(PhosphoSitePlus/iPTMNet)", "stroke": "black"}],
        },
        {
            type: 'lollipop',
            id: 'Other',
            label: 'Other PTMs',
            color:'grey',
            data: [{"x": 109, "y": 109, "color": "#F4B5C7", "tooltip": "109S O-glycosylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 241, "y": 241, "color": "#F4B5C7", "tooltip": "241T O-glycosylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 497, "y": 497, "color": "#FF6961", "tooltip": "497K Methylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 494, "y": 494, "color": "#FF6961", "tooltip": "494K Methylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 97, "y": 97, "color": "#e83484", "tooltip": "97K Sumoylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 280, "y": 280, "color": "#86CBED", "tooltip": "280K Sumoylation</br>(PhosphoSitePlus)", "stroke": "black"}, {"x": 315, "y": 315, "color": "#A7E99C", "tooltip": "315K Acetylation</br>(PhosphoSitePlus)", "stroke": "black"}],
        },
        {
            type: 'circle',
            id: 'Missense',
            label: 'Missense mutations',
            color:'grey',
            data: [{"x": 132, "y": 0.1, "color": "#00008b", "tooltip": "L132R", "stroke": "black"}, {"x": 180, "y": 0.1, "color": "#00008b", "tooltip": "A180T", "stroke": "black"}, {"x": 354, "y": 0.1, "color": "#00008b", "tooltip": "T354A", "stroke": "black"}, {"x": 456, "y": 0.1, "color": "#00008b", "tooltip": "G456E", "stroke": "black"}, {"x": 119, "y": 0.1, "color": "#00008b", "tooltip": "T119S", "stroke": "black"}, {"x": 133, "y": 0.1, "color": "#00008b", "tooltip": "Q133H", "stroke": "black"}, {"x": 501, "y": 0.1, "color": "#00008b", "tooltip": "L501I", "stroke": "black"}, {"x": 209, "y": 0.2, "color": "#00008b", "tooltip": "Q209L Q209H", "stroke": "black"}, {"x": 390, "y": 0.1, "color": "#00008b", "tooltip": "T390I", "stroke": "black"}, {"x": 436, "y": 0.1, "color": "#00008b", "tooltip": "S436T", "stroke": "black"}, {"x": 383, "y": 0.2, "color": "#00008b", "tooltip": "D383H D383G", "stroke": "black"}, {"x": 279, "y": 0.1, "color": "#00008b", "tooltip": "V279L", "stroke": "black"}, {"x": 127, "y": 0.1, "color": "#00008b", "tooltip": "S127F", "stroke": "black"}, {"x": 396, "y": 0.1, "color": "#00008b", "tooltip": "E396K", "stroke": "black"}, {"x": 478, "y": 0.1, "color": "#00008b", "tooltip": "L478F", "stroke": "black"}, {"x": 459, "y": 0.1, "color": "#00008b", "tooltip": "E459K", "stroke": "black"}, {"x": 399, "y": 0.2, "color": "#00008b", "tooltip": "D399G D399H", "stroke": "black"}, {"x": 488, "y": 0.1, "color": "#00008b", "tooltip": "S488Y", "stroke": "black"}, {"x": 124, "y": 0.2, "color": "#00008b", "tooltip": "R124P R124Q", "stroke": "black"}, {"x": 371, "y": 0.1, "color": "#00008b", "tooltip": "S371F", "stroke": "black"}, {"x": 145, "y": 0.1, "color": "#00008b", "tooltip": "T145S", "stroke": "black"}, {"x": 106, "y": 0.1, "color": "#00008b", "tooltip": "R106G", "stroke": "black"}, {"x": 225, "y": 0.1, "color": "#00008b", "tooltip": "M225I", "stroke": "black"}, {"x": 151, "y": 0.1, "color": "#00008b", "tooltip": "P151A", "stroke": "black"}, {"x": 61, "y": 0.1, "color": "#00008b", "tooltip": "S61W", "stroke": "black"}, {"x": 231, "y": 0.1, "color": "#00008b", "tooltip": "P231S", "stroke": "black"}, {"x": 367, "y": 0.1, "color": "#00008b", "tooltip": "S367F", "stroke": "black"}, {"x": 429, "y": 0.1, "color": "#00008b", "tooltip": "I429L", "stroke": "black"}, {"x": 167, "y": 0.1, "color": "#00008b", "tooltip": "I167T", "stroke": "black"}, {"x": 306, "y": 0.1, "color": "#00008b", "tooltip": "M306I", "stroke": "black"}, {"x": 427, "y": 0.1, "color": "#00008b", "tooltip": "D427H", "stroke": "black"}, {"x": 210, "y": 0.1, "color": "#00008b", "tooltip": "M210I", "stroke": "black"}, {"x": 73, "y": 0.1, "color": "#00008b", "tooltip": "M73I", "stroke": "black"}, {"x": 460, "y": 0.1, "color": "#00008b", "tooltip": "G460E", "stroke": "black"}, {"x": 481, "y": 0.1, "color": "#00008b", "tooltip": "D481H", "stroke": "black"}, {"x": 234, "y": 0.1, "color": "#00008b", "tooltip": "D234H", "stroke": "black"}, {"x": 319, "y": 0.1, "color": "#00008b", "tooltip": "R319Q", "stroke": "black"}, {"x": 162, "y": 0.1, "color": "#00008b", "tooltip": "Q162R", "stroke": "black"}, {"x": 125, "y": 0.1, "color": "#00008b", "tooltip": "A125G", "stroke": "black"}, {"x": 266, "y": 0.1, "color": "#00008b", "tooltip": "R266C", "stroke": "black"}, {"x": 166, "y": 0.1, "color": "#00008b", "tooltip": "E166G", "stroke": "black"}, {"x": 246, "y": 0.1, "color": "#00008b", "tooltip": "I246M", "stroke": "black"}],
        },
    ]);
};
