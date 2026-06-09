import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.schemas.analysis_history import (
    AnalysisHistoryIn,
    AnalysisHistoryOut,
    AnalysisHistoryPage,
)
from app.api.deps import require_user
from app.services.analysis_history_service import (
    create_analysis_history,
    list_analysis_history,
    get_analysis_history_by_id,
)

router = APIRouter(prefix="/analysis-history", tags=["analysis_history"])

@router.post("", response_model=AnalysisHistoryOut, status_code=status.HTTP_201_CREATED)
def analysis(
    data: AnalysisHistoryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    record = create_analysis_history(db, current_user, data)
    return record

@router.get("", response_model=AnalysisHistoryPage)
def get_history(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if page < 1:
        page = 1
    if limit <= 0:
        limit = 20

    skip = (page - 1) * limit

    items, total = list_analysis_history(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
    )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return AnalysisHistoryPage(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

@router.get("/{history_id}", response_model=AnalysisHistoryOut)
def get_history_detail(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    record = get_analysis_history_by_id(db, current_user, history_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analyze history not found",
        )
    return record

@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    record = get_analysis_history_by_id(db, current_user, history_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analyze history not found",
        )
    db.delete(record)
    db.commit()
    return  None