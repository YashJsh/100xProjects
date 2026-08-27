from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from src.db.session import get_db
from src.types.project_types import *
from src.db.schema import Project, Proposal, UserRole, ProjectStatus, ProposalStatus, ContractStatus, Contract
from sqlalchemy import select, update

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)

@router.post("/")
async def create_project(
    req : Request,
    body : CreateProjectSchema,
    db: AsyncSession = Depends(get_db)
):
    user_id = req.state.user["user_id"]
    role = req.state.user["role"]

    if UserRole.Freelancer != role:
        raise HTTPException(403, "Only client can create project")

    project = Project(
        title=body.title,
        description=body.description,
        category=body.category,
        minBudget=body.budgetMin,
        maxBudget=body.budgetMax,
        deadline=body.deadline,
        creator_id=user_id
    )

    try:
        db.add(project)
        await db.commit()
        await db.refresh(project)

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create project"
        )

    return {
        "success": True,
        "data" : project
    }


@router.get("/")
async def get_projects(
    category: str | None = None,
    minBudget: int | None = None,
    maxBudget: int | None = None,
    db: AsyncSession= Depends(get_db)
):
    query = select(Project).where(
        Project.status == ProjectStatus.Open
    )
    if category is not None:
        query = query.where(Project.category == category)
    if minBudget is not None:
        query = query.where(Project.minBudget >= minBudget)

    if maxBudget is not None:
        query = query.where(Project.maxBudget <= maxBudget)

    try:
        result = await db.execute(query)
        projects = result.scalars().all()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch projects"
        )

    return {
        "success": True,
        "data": projects
    }


# /api/projects/:projectId/proposals
# Freelancer router only
@router.post("/{projectId}/proposals")
async def proposal(
    req : Request,
    projectId : str,
    body : CreateProposalSchema,
    db: AsyncSession = Depends(get_db)
):
    user_id = req.state.user["user_id"]
    role = req.state.user["role"]

    if role != UserRole.Freelancer:
        raise HTTPException(
            403,
            "Only freelancers can submit proposals"
        )

    get_project = await db.execute(select(Project).where(Project.id == projectId))
    project = get_project.scalar_one_or_none()

    if not project:
        raise HTTPException(404, "Project Not Found")

    if project.status != ProjectStatus.Open:
        raise HTTPException(403, "Project is not open")

    get_proposal = await db.execute(select(Proposal).where(Proposal.freelancer_id == user_id, Proposal.project_id == projectId))
    if get_proposal.scalar_one_or_none():
        raise HTTPException(409, "Proposal Already submitted")

    new_proposal = Proposal(
        cover_letter=body.coverLetter,
        proposal_price=body.proposedPrice,
        estimated_duration=body.estimatedDuration,
        freelancer_id=user_id,
        project_id=projectId
    )

    try:
        db.add(new_proposal)
        await db.commit()
        await db.refresh(new_proposal)

    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "Proposal already submitted")
    
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create proposal"
        )
    

    return {
        "success" : True,
        "data" : new_proposal
    }


# Client only /api/projects/:projectId/proposals
@router.get("/{projectId}/proposals")
async def client_proposal(
    request: Request,
    projectId: str,
    db : AsyncSession=Depends(get_db)
):
    try:
        project = await db.execute(select(Project).where(Project.id == projectId))
        proj = project.scalar_one_or_none()

        if not proj:
            raise HTTPException(404, "Project not found")

        if proj.creator_id != request.state.user["user_id"]:
            raise HTTPException(403, "Only creator of Project is allowed to view Proposal")
        
        prop = await db.execute(select(Proposal).where(
            Proposal.project_id==projectId
        ))
        proposals = prop.scalars().all()

        return {
            "success": True,
            "proposals": proposals
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            500,
            "Something went wrong"
        )
    

# Client only /api/proposals/:proposalId/accept
@router.put("/{proposalId}/accept")
async def accept_proposal(
    request: Request,
    proposalId : str,
    db: AsyncSession=Depends(get_db)
):
    user_role = request.state.user["role"]
    user_id = request.state.user["user_id"]

    if user_role != UserRole.Client:
        raise HTTPException(403, "Freelancers can't accept the proposal")
    
    async with db.begin():
        project = await db.execute(select(Proposal).where(Proposal.id == proposalId))
        proposal = project.scalar_one_or_none()
        
        if not proposal:
            raise HTTPException(404, "Proposal not found")
        
        if proposal.project.creator_id != request.state.user["user_id"]:
            raise HTTPException(403, "Only creator of Project is allowed to view Proposal and accept proposals") 
            
        project_id = proposal.project_id

        await db.execute(
            update(Proposal)
            .where(
                Proposal.project_id == project_id,
                Proposal.id != proposal.id
            )
            .values(
                status=ProposalStatus.Rejected
            )
        )

        proposal.status = ProposalStatus.Accepted

        proposal.project.status = ProjectStatus.InProgress

        new_contract = Contract(
            project_id=project_id,
            proposal_id=proposal.id,
            client_id=user_id,
            freelancer_id=proposal.freelancer_id,
            aggreed_price=proposal.proposal_price,
            status=ContractStatus.Active
        )

        db.add(new_contract)

    await db.refresh(new_contract)

    return {
        "success": True,
        "data" : {
            "project": new_contract.project,
            "client" : new_contract.client,
            "Freelancer": new_contract.freelancer,
            "Amount" : new_contract.aggreed_price,
            "Status": new_contract.status,
            "Created At": new_contract.created_at
        }
    }