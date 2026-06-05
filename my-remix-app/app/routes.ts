import { form, get, post, route } from 'remix/fetch-router/routes'

export const routes = route({
  assets: get('/assets/*path'),
  stylePreviewCozyWatercolor: get('/style-previews/cozy-watercolor.png'),
  stylePreviewBrightCartoon: get('/style-previews/bright-cartoon.png'),
  stylePreviewColoredPencil: get('/style-previews/colored-pencil.png'),
  stylePreviewPaperCutout: get('/style-previews/paper-cutout.png'),
  home: '/',
  auth: form('/auth'),
  logout: post('/logout'),
  storyApp: route('story-app', {
    index: get('/'),
    dictation: post('dictation'),
    words: form('words'),
    series: form('series'),
    seriesDetail: form('series/:seriesId'),
    seriesEvents: get('series/:seriesId/events'),
    library: form('library'),
    newStory: form('new'),
    story: form('stories/:storyId'),
    billing: form('billing'),
  }),
})
