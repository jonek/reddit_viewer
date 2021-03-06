import { CollectionView, Page, PropertyChangedEvent } from 'tabris';
import { component, event, getById, injectable, Listeners } from 'tabris-decorators';
import RedditGalleryCell from './RedditGalleryCell';
import RedditListCell from './RedditListCell';
import ViewModeToggleAction from './ViewModeToggleAction';
import { FILL_LAYOUT, isList, RedditPost, ViewMode } from '../common';
import * as common from '../common';

@component
@injectable({implements: common.SubredditView})
export default class SubredditPage extends Page implements common.SubredditView {

  @event public readonly onItemSelected: Listeners<{item: RedditPost}>;
  @event public readonly onItemsRequested: Listeners;
  public readonly viewModeToggleView: ViewModeToggleAction = (
    <ViewModeToggleAction page={this}/>
  );

  private _items: RedditPost[] = [];
  private _mode: ViewMode;
  private loading: boolean;
  @getById private collectionView: CollectionView;

  constructor(properties?: Partial<SubredditPage>) {
    super(properties);
    this.append(
      <collectionView id='collectionView'
          {...FILL_LAYOUT}
          background='#f5f5f5'
          cellType={() => this._mode}
          cellHeight={(index, type) => isList(type) ? 96 : 160}
          createCell={type => isList(type) ? <RedditListCell /> : <RedditGalleryCell />}
          updateCell={(view, index) => (view as Cell).item = this._items[index].data}
          onSelect={ev => this.onItemSelected.trigger({item: this._items[ev.index]})}
          onLastVisibleIndexChanged={this.handleLastVisibleIndexChanged}/>
    );
  }

  public set mode(mode: ViewMode) {
    if (this._mode !== mode) {
      this._mode = mode;
      this.collectionView.columnCount = isList(this.mode) ? 1 : 3;
      this.collectionView.load(this.items.length);
    }
  }

  public get mode() {
    return this._mode;
  }

  public get items() {
    return this._items.concat(); // safe copy
  }

  public clear() {
    this._items = [];
    this.collectionView.itemCount = 0;
  }

  public addItems(newItems: RedditPost[]) {
    this.loading = false;
    const insertionIndex = this._items.length;
    this._items = this._items.concat(newItems);
    this.collectionView.insert(insertionIndex, newItems.length);
    this.collectionView.refreshIndicator = false;
  }

  private handleLastVisibleIndexChanged = ({ value }: PropertyChangedEvent<CollectionView, number>) => {
    if (this._items.length - value < (20 / this.collectionView.columnCount) && !this.loading) {
      this.loading = true;
      this.onItemsRequested.trigger();
    }
  }

}

type Cell = RedditListCell | RedditGalleryCell;
