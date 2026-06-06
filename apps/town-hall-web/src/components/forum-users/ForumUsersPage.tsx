'use client';

import { ArrowRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLayout } from '@/components/ui/page-layout';
import { cn } from '@/lib/utils';
import type { ForumUserEntry, ForumUsersPageViewModel, ForumUserTab } from './useForumUsersPage';

// --- Avatar initials ---

function UserAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground text-xs">
      {initials || '?'}
    </div>
  );
}

// --- Sort icon ---

type SortDir = 'asc' | 'desc' | null;

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') {
    return <ChevronUp className="size-3.5" />;
  }
  if (dir === 'desc') {
    return <ChevronDown className="size-3.5" />;
  }
  return (
    <span className="flex flex-col">
      <ChevronUp className="-mb-1 size-3" />
      <ChevronDown className="size-3" />
    </span>
  );
}

// --- Format date ---

function fmtDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// --- Ban Modal ---

function BanModal({
  user,
  open,
  onClose,
  onConfirm,
}: {
  user: ForumUserEntry | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(user.userId);
    setLoading(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('forumUsers.banModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base text-foreground">{t('forumUsers.banModal.reasonLabel')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('forumUsers.banModal.reasonPlaceholder')}
              rows={7}
              className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-base text-foreground">{t('forumUsers.banModal.informUser')}</span>
            <div className="flex gap-8">
              <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="size-4 accent-primary"
                />
                {t('forumUsers.banModal.sendEmail')}
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="size-4 accent-primary"
                />
                {t('forumUsers.banModal.sendPush')}
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('forumUsers.banModal.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading} className="gap-1.5">
            {t('forumUsers.banModal.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Unban Modal ---

function UnbanModal({
  user,
  open,
  onClose,
  onConfirm,
}: {
  user: ForumUserEntry | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(user.userId);
    setLoading(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('forumUsers.unbanModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base text-foreground">{t('forumUsers.unbanModal.reasonLabel')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('forumUsers.unbanModal.reasonPlaceholder')}
              rows={7}
              className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-base text-foreground">{t('forumUsers.unbanModal.informUser')}</span>
            <div className="flex gap-8">
              <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="size-4 accent-primary"
                />
                {t('forumUsers.unbanModal.sendEmail')}
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-sm">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="size-4 accent-primary"
                />
                {t('forumUsers.unbanModal.sendPush')}
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('forumUsers.unbanModal.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading} className="gap-1.5">
            {t('forumUsers.unbanModal.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- User Info Modal ---

function UserInfoModal({ user, open, onClose }: { user: ForumUserEntry | null; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('forumUsers.infoModal.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-4">
            <span className="w-36 shrink-0 font-medium text-foreground text-sm">
              {t('forumUsers.infoModal.profilePicture')}
            </span>
            <div className="flex size-12 items-center justify-center rounded-full bg-muted font-bold text-base text-muted-foreground">
              {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-36 shrink-0 font-medium text-foreground text-sm">
              {t('forumUsers.infoModal.username')}
            </span>
            <span className="text-foreground text-sm">{user.username}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-36 shrink-0 font-medium text-foreground text-sm">
              {t('forumUsers.infoModal.lastConnection')}
            </span>
            <span className="text-foreground text-sm">{fmtDateTime(user.lastConnection)}</span>
          </div>
          {user.banned && user.bannedAt && (
            <div className="flex items-center gap-4">
              <span className="w-36 shrink-0 font-medium text-foreground text-sm">
                {t('forumUsers.infoModal.banSince')}
              </span>
              <span className="text-foreground text-sm">{fmtDateTime(user.bannedAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="w-36 shrink-0 font-medium text-foreground text-sm">
              {t('forumUsers.infoModal.memberSince')}
            </span>
            <span className="text-foreground text-sm">{fmtDate(user.memberSince)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('forumUsers.infoModal.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Active accounts table ---

function ActiveTable({
  data,
  onBan,
  onMore,
}: {
  data: ForumUserEntry[];
  onBan: (user: ForumUserEntry) => void;
  onMore: (user: ForumUserEntry) => void;
}) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<'username' | 'threadCount' | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const toggle = (field: 'username' | 'threadCount') => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!(sortField && sortDir)) {
      return 0;
    }
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'username') {
      return mul * a.username.localeCompare(b.username);
    }
    return mul * (a.threadCount - b.threadCount);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16">
        <p className="text-muted-foreground text-sm">{t('forumUsers.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border border-b bg-muted/30">
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => toggle('username')}
                className="flex items-center gap-1 font-semibold text-foreground"
              >
                {t('forumUsers.table.username')}
                <SortIcon dir={sortField === 'username' ? sortDir : null} />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => toggle('threadCount')}
                className="flex items-center gap-1 font-semibold text-foreground"
              >
                {t('forumUsers.table.contributions')}
                <SortIcon dir={sortField === 'threadCount' ? sortDir : null} />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('forumUsers.table.status')}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((user, i) => (
            <tr
              key={user.userId}
              className={cn(
                'border-border border-b transition-colors last:border-0 hover:bg-muted/20',
                i % 2 === 1 && 'bg-muted/10',
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                  <span className="font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user.threadCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{t('forumUsers.status.active')}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="destructive" onClick={() => onBan(user)} className="gap-1.5">
                    {t('forumUsers.actions.ban')}
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onMore(user)} className="gap-1.5">
                    {t('forumUsers.actions.more')}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Banned accounts table ---

function BannedTable({
  data,
  onUnban,
  onMore,
}: {
  data: ForumUserEntry[];
  onUnban: (user: ForumUserEntry) => void;
  onMore: (user: ForumUserEntry) => void;
}) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<'username' | 'threadCount' | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const toggle = (field: 'username' | 'threadCount') => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!(sortField && sortDir)) {
      return 0;
    }
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'username') {
      return mul * a.username.localeCompare(b.username);
    }
    return mul * (a.threadCount - b.threadCount);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16">
        <p className="text-muted-foreground text-sm">{t('forumUsers.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border border-b bg-muted/30">
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => toggle('username')}
                className="flex items-center gap-1 font-semibold text-foreground"
              >
                {t('forumUsers.table.username')}
                <SortIcon dir={sortField === 'username' ? sortDir : null} />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => toggle('threadCount')}
                className="flex items-center gap-1 font-semibold text-foreground"
              >
                {t('forumUsers.table.contributions')}
                <SortIcon dir={sortField === 'threadCount' ? sortDir : null} />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('forumUsers.table.dateBan')}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((user, i) => (
            <tr
              key={user.userId}
              className={cn(
                'border-border border-b transition-colors last:border-0 hover:bg-muted/20',
                i % 2 === 1 && 'bg-muted/10',
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                  <span className="font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user.threadCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(user.bannedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => onUnban(user)}
                    className="gap-1.5 bg-green-700 text-white hover:bg-green-800"
                  >
                    {t('forumUsers.actions.unban')}
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onMore(user)} className="gap-1.5">
                    {t('forumUsers.actions.more')}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main page ---

export function ForumUsersPage(vm: ForumUsersPageViewModel) {
  const { t } = useTranslation();
  const { isLoading, error, tab, setTab, search, setSearch, activeUsers, bannedUsers, banUser, unbanUser } = vm;

  const [banTarget, setBanTarget] = useState<ForumUserEntry | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<ForumUserEntry | null>(null);
  const [infoTarget, setInfoTarget] = useState<ForumUserEntry | null>(null);

  const TABS: { id: ForumUserTab; label: string }[] = [
    { id: 'active', label: t('forumUsers.tabs.active') },
    { id: 'banned', label: t('forumUsers.tabs.banned') },
  ];

  return (
    <PageLayout title={t('forumUsers.title')}>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t_) => (
          <button
            key={t_.id}
            type="button"
            onClick={() => setTab(t_.id)}
            className={cn(
              '-mb-px border-b-2 px-5 py-2 font-medium text-sm transition-colors',
              tab === t_.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('forumUsers.search')}
          className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <Search className="size-4 text-muted-foreground" />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-destructive text-sm">{t('forumUsers.error')}</p>
        </div>
      ) : tab === 'active' ? (
        <ActiveTable data={activeUsers} onBan={setBanTarget} onMore={setInfoTarget} />
      ) : (
        <BannedTable data={bannedUsers} onUnban={setUnbanTarget} onMore={setInfoTarget} />
      )}

      {/* Modals */}
      <BanModal
        user={banTarget}
        open={banTarget !== null}
        onClose={() => setBanTarget(null)}
        onConfirm={async (userId) => {
          await banUser(userId);
          setBanTarget(null);
        }}
      />
      <UnbanModal
        user={unbanTarget}
        open={unbanTarget !== null}
        onClose={() => setUnbanTarget(null)}
        onConfirm={async (userId) => {
          await unbanUser(userId);
          setUnbanTarget(null);
        }}
      />
      <UserInfoModal user={infoTarget} open={infoTarget !== null} onClose={() => setInfoTarget(null)} />
    </PageLayout>
  );
}
