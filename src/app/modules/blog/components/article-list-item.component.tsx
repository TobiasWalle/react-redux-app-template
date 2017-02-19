import * as React from 'react';
import { Article } from "../models/article";
import { WithStyles } from "isomorphic-style-loader-utils";
const styles = require('./article-list-item.component.scss');

export interface ArticleListItemProps {
  article: Article,
  onDeleteClicked?: (article) => void
}

@WithStyles(styles)
export class ArticleListItemComponent extends React.Component<ArticleListItemProps, any> {
  public render(): JSX.Element {
    let { article, onDeleteClicked }= this.props;
    return (
      <div className={styles['article-list-item']}>
        <h2>{article.subject}</h2>
        <p>{article.body}</p>

        <input type="button" className={`button-delete ${styles['button-delete-article']}` } value="x"
               onClick={() =>
               onDeleteClicked ? onDeleteClicked(article) : null}
        />
      </div>
    )
  }
}