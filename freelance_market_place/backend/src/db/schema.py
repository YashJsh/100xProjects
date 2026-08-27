from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship, Mapped 
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum, DateTime, UniqueConstraint
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    Client = "client"
    Freelancer = "freelancer"


class ProjectStatus(str, Enum):
    Open = "open"
    InProgress = "in_progress"
    Closed = "closed"


class ProposalStatus(str, Enum):
    Pending = "pending"
    Accepted = "accepted"
    Rejected = "rejected"


class ContractStatus(str, Enum):
    Active = "active"
    Completed = "completed"
    Pending = "pending"


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )

    projects: Mapped[list["Project"]] = relationship(
        back_populates="creator"
    )

    proposals: Mapped[list["Proposal"]] = relationship(
        back_populates="freelancer"
    )

    client_contracts: Mapped[list["Contract"]] = relationship(
        foreign_keys="Contract.client_id",
        back_populates="client",
    )

    freelancer_contracts: Mapped[list["Contract"]] = relationship(
        foreign_keys="Contract.freelancer_id",
        back_populates="freelancer",
    )


class Project(Base):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(255)
    )

    description: Mapped[str] = mapped_column(
        String(255)
    )

    category: Mapped[str] = mapped_column(
        String(255)
    )

    maxBudget: Mapped[int] = mapped_column(
        Integer
    )

    minBudget: Mapped[int] = mapped_column(
        Integer
    )

    Deadline: Mapped[datetime] = mapped_column(
        DateTime
    )

    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus), default=ProjectStatus.Open
    )

    creator_id: Mapped[int] = mapped_column(
        ForeignKey("user.id")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )

    creator: Mapped["User"] = relationship(
        back_populates="projects"
    )

    proposals: Mapped[list["Proposal"]] = relationship(
        back_populates="project"
    )

    contracts: Mapped["Contract | None"] = relationship(
        back_populates="project"
    )


class Proposal(Base):
    __tablename__ = "proposal"

    __table_args__ = (
        UniqueConstraint(
            "freelancer_id",
            "project_id",
            name="unique_freelancer_project_proposal"
        )
    )

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    cover_letter: Mapped[str] = mapped_column(
        String(255)
    )

    proposal_price: Mapped[int] = mapped_column(
        Integer
    )

    estimated_duration: Mapped[int] = mapped_column(
        Integer
    )

    freelancer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id")
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id")
    )

    freelancer: Mapped["User"] = relationship(
        back_populates="proposals"
    )

    project: Mapped["Project"] = relationship(
        back_populates="proposals"
    )

    status: Mapped[ProposalStatus] = mapped_column(
        SQLEnum(ProposalStatus), default=ProposalStatus.Pending
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )


class Contract(Base):
    __tablename__ = "contract"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id"),
        nullable=False,
        unique=True
    )

    project: Mapped["Project"] = relationship(
        back_populates="contracts"
    )

    proposal_id: Mapped[int] = mapped_column(
        ForeignKey("proposal.id"),
        nullable=False,
        unique=True
    )

    proposal: Mapped["Proposal"] = relationship(
        back_populates="contract"
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("user.id")
    )

    client: Mapped["User"] = relationship(
        foreign_keys=[client_id],
        back_populates="client_contracts",
    )

    freelancer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id")
    )

    freelancer: Mapped["User"] = relationship(
        foreign_keys=[freelancer_id],
        back_populates="freelancer_contracts",
    )

    aggreed_price: Mapped[int] = mapped_column(
        Integer
    )

    status: Mapped[ContractStatus] = mapped_column(
        SQLEnum(ContractStatus),
        default=ContractStatus.Pending
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now
    )