import * as React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { NotFoundComponent } from './components/not-found.component';

export const routes: JSX.Element = (
  <Route path='/'>
    <Route path='*' component={NotFoundComponent}/>
  </Route>
);
