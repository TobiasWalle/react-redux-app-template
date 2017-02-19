import * as React from 'react';
import { Article } from "../models/article";
import { ArticleListItemComponent } from "./article-list-item.component";
import { Link } from "react-router";


export interface ArticleListProps {
  articles?: Article[];
  articlesDownloaded?: boolean;
  fetchArticles?: () => void;
  deleteArticle?: (article: Article) => void;
}

export class ArticleListComponent extends React.Component<ArticleListProps, any> {

  componentDidMount() {
    if (!this.props.articlesDownloaded) {
      this.props.fetchArticles();
    }
  }

  public render(): JSX.Element {
    let {articles, deleteArticle} = this.props;
    return (
      <div>
        {
          articles.map((article) => (
            <Link className="no-style" key={article.id} to={"/blog/article/" + article.id}>
              <ArticleListItemComponent
                article={article}
                onDeleteClicked={(article) => deleteArticle(article)}
              />
            </Link>
          ))
        }
      </div>
    )
  }
}